#!/usr/bin/env python3
"""
Create Azure AI Search Index for GraphRAG
==========================================
Creates the 'warfarecfo' index and loads policy documents (keyword search).
"""

import os
import json
import httpx
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Azure AI Search Configuration
SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT", "https://vectorstore25.search.windows.net")
SEARCH_API_KEY = os.getenv("AZURE_SEARCH_API_KEY")
INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX_NAME", "warfarecfo")

# SQLite database path
DB_PATH = Path(__file__).parent / "claims_data" / "sqlite" / "claims_data_small.db"

def create_index():
    """Create the Azure AI Search index (keyword search)."""
    index_schema = {
        "name": INDEX_NAME,
        "fields": [
            {"name": "id", "type": "Edm.String", "key": True, "searchable": False},
            {"name": "payer_id", "type": "Edm.String", "filterable": True, "facetable": True, "searchable": True},
            {"name": "payer_name", "type": "Edm.String", "searchable": True},
            {"name": "doc_type", "type": "Edm.String", "filterable": True, "facetable": True, "searchable": True},
            {"name": "title", "type": "Edm.String", "searchable": True},
            {"name": "content", "type": "Edm.String", "searchable": True},
            {"name": "policy_id", "type": "Edm.String", "filterable": True, "searchable": True},
            {"name": "effective_date", "type": "Edm.String", "filterable": True},
            {"name": "summary", "type": "Edm.String", "searchable": True},
            {"name": "tags", "type": "Collection(Edm.String)", "filterable": True, "facetable": True}
        ]
    }
    
    # Delete existing index if it exists
    delete_url = f"{SEARCH_ENDPOINT}/indexes/{INDEX_NAME}?api-version=2024-07-01"
    response = httpx.delete(delete_url, headers={"api-key": SEARCH_API_KEY})
    if response.status_code == 204:
        print(f"Deleted existing index: {INDEX_NAME}")
    
    # Create new index
    create_url = f"{SEARCH_ENDPOINT}/indexes?api-version=2024-07-01"
    response = httpx.post(
        create_url,
        headers={"api-key": SEARCH_API_KEY, "Content-Type": "application/json"},
        json=index_schema
    )
    
    if response.status_code in [200, 201]:
        print(f"Created index: {INDEX_NAME}")
        return True
    else:
        print(f"Error creating index: {response.status_code} - {response.text}")
        return False

def load_documents():
    """Load documents from SQLite into Azure AI Search."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    documents = []
    
    # Load policies
    cursor.execute("SELECT * FROM kg_policies")
    policies = cursor.fetchall()
    
    print(f"Loading {len(policies)} policies...")
    
    for policy in policies:
        policy_dict = dict(policy)
        content = f"{policy_dict.get('title', '')} {policy_dict.get('summary', '')} {policy_dict.get('full_text', '')}"
        
        # Parse tags
        tags = []
        try:
            tags = json.loads(policy_dict.get('tags', '[]'))
        except:
            pass
        
        doc = {
            "id": policy_dict.get('policy_id', '').replace('-', '_').replace('.', '_'),
            "payer_id": policy_dict.get('payer_id', ''),
            "payer_name": policy_dict.get('payer_name', ''),
            "doc_type": policy_dict.get('policy_type', 'policy'),
            "title": policy_dict.get('title', ''),
            "content": content[:30000],
            "policy_id": policy_dict.get('policy_id', ''),
            "effective_date": policy_dict.get('effective_date', ''),
            "summary": policy_dict.get('summary', ''),
            "tags": tags if isinstance(tags, list) else []
        }
        documents.append(doc)
    
    # Load chunks
    cursor.execute("SELECT * FROM kg_chunks")
    chunks = cursor.fetchall()
    
    print(f"Loading {len(chunks)} chunks...")
    
    for i, chunk in enumerate(chunks):
        chunk_dict = dict(chunk)
        content = chunk_dict.get('content', '') or ''
        
        doc = {
            "id": (chunk_dict.get('chunk_id', '') or f"chunk_{i}").replace('-', '_').replace('.', '_'),
            "payer_id": chunk_dict.get('payer_id', ''),
            "payer_name": "",
            "doc_type": chunk_dict.get('doc_type', 'chunk'),
            "title": chunk_dict.get('title', ''),
            "content": content[:30000],
            "policy_id": chunk_dict.get('doc_id', ''),
            "effective_date": "",
            "summary": "",
            "tags": []
        }
        documents.append(doc)
    
    conn.close()
    
    # Upload documents in batches
    batch_size = 50
    upload_url = f"{SEARCH_ENDPOINT}/indexes/{INDEX_NAME}/docs/index?api-version=2024-07-01"
    
    total_uploaded = 0
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        payload = {"value": [{"@search.action": "upload", **doc} for doc in batch]}
        
        response = httpx.post(
            upload_url,
            headers={"api-key": SEARCH_API_KEY, "Content-Type": "application/json"},
            json=payload,
            timeout=60.0
        )
        
        if response.status_code in [200, 201]:
            total_uploaded += len(batch)
            print(f"Uploaded batch {i//batch_size + 1}: {len(batch)} documents (total: {total_uploaded})")
        else:
            print(f"Error uploading batch: {response.status_code} - {response.text[:500]}")
    
    print(f"\nTotal documents uploaded: {total_uploaded}")
    return total_uploaded

def test_search():
    """Test the search index."""
    search_url = f"{SEARCH_ENDPOINT}/indexes/{INDEX_NAME}/docs/search?api-version=2024-07-01"
    
    # Test keyword search
    response = httpx.post(
        search_url,
        headers={"api-key": SEARCH_API_KEY, "Content-Type": "application/json"},
        json={
            "search": "observation denial UHC",
            "top": 3,
            "select": "id,payer_id,title,doc_type"
        }
    )
    
    if response.status_code == 200:
        results = response.json()
        print(f"\nSearch test results ({results.get('@odata.count', 'N/A')} total):")
        for doc in results.get("value", []):
            print(f"  - {doc.get('id')}: {doc.get('title')} ({doc.get('payer_id')})")
    else:
        print(f"Search test failed: {response.status_code}")

def main():
    print("=" * 60)
    print("Azure AI Search Index Builder for GraphRAG")
    print("=" * 60)
    print(f"Endpoint: {SEARCH_ENDPOINT}")
    print(f"Index: {INDEX_NAME}")
    print(f"Database: {DB_PATH}")
    print()
    
    if not SEARCH_API_KEY:
        print("ERROR: AZURE_SEARCH_API_KEY not set")
        return
    
    # Create index
    if not create_index():
        return
    
    # Load documents
    load_documents()
    
    # Test search
    test_search()
    
    print("\nDone! Azure AI Search index is ready.")

if __name__ == "__main__":
    main()
