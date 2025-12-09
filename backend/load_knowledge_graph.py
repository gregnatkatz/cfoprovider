#!/usr/bin/env python3
"""
Load Knowledge Graph into SQLite for GraphRAG
==============================================
Creates kg_nodes and kg_edges tables and loads the knowledge graph data.
"""

import json
import sqlite3
from pathlib import Path

# Paths
POLICY_DOCS_DIR = Path(__file__).parent / "policy_docs"
DB_PATH = Path(__file__).parent / "claims_data" / "sqlite" / "claims_data_small.db"

def create_kg_tables(conn: sqlite3.Connection):
    """Create knowledge graph tables."""
    cursor = conn.cursor()
    
    # Drop existing tables if they exist
    cursor.execute("DROP TABLE IF EXISTS kg_nodes")
    cursor.execute("DROP TABLE IF EXISTS kg_edges")
    cursor.execute("DROP TABLE IF EXISTS kg_chunks")
    cursor.execute("DROP TABLE IF EXISTS kg_policies")
    
    # Create nodes table
    cursor.execute("""
        CREATE TABLE kg_nodes (
            node_id TEXT PRIMARY KEY,
            node_type TEXT NOT NULL,
            name TEXT,
            payer_id TEXT,
            attributes TEXT
        )
    """)
    
    # Create edges table
    cursor.execute("""
        CREATE TABLE kg_edges (
            edge_id TEXT PRIMARY KEY,
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            edge_type TEXT NOT NULL,
            attributes TEXT,
            FOREIGN KEY (source_id) REFERENCES kg_nodes(node_id),
            FOREIGN KEY (target_id) REFERENCES kg_nodes(node_id)
        )
    """)
    
    # Create chunks table for text retrieval
    cursor.execute("""
        CREATE TABLE kg_chunks (
            chunk_id TEXT PRIMARY KEY,
            doc_id TEXT,
            payer_id TEXT,
            doc_type TEXT,
            title TEXT,
            content TEXT,
            metadata TEXT
        )
    """)
    
    # Create policies table for full policy text
    cursor.execute("""
        CREATE TABLE kg_policies (
            policy_id TEXT PRIMARY KEY,
            payer_id TEXT,
            payer_name TEXT,
            policy_type TEXT,
            title TEXT,
            effective_date TEXT,
            version TEXT,
            status TEXT,
            summary TEXT,
            full_text TEXT,
            applicable_cpt_codes TEXT,
            tags TEXT
        )
    """)
    
    # Create indexes
    cursor.execute("CREATE INDEX idx_kg_nodes_type ON kg_nodes(node_type)")
    cursor.execute("CREATE INDEX idx_kg_nodes_payer ON kg_nodes(payer_id)")
    cursor.execute("CREATE INDEX idx_kg_edges_source ON kg_edges(source_id)")
    cursor.execute("CREATE INDEX idx_kg_edges_target ON kg_edges(target_id)")
    cursor.execute("CREATE INDEX idx_kg_edges_type ON kg_edges(edge_type)")
    cursor.execute("CREATE INDEX idx_kg_chunks_payer ON kg_chunks(payer_id)")
    cursor.execute("CREATE INDEX idx_kg_chunks_doc_type ON kg_chunks(doc_type)")
    cursor.execute("CREATE INDEX idx_kg_policies_payer ON kg_policies(payer_id)")
    
    conn.commit()
    print("Created knowledge graph tables")

def load_knowledge_graph(conn: sqlite3.Connection):
    """Load knowledge graph entities and relationships."""
    kg_path = POLICY_DOCS_DIR / "knowledge_graph.json"
    
    with open(kg_path, 'r') as f:
        kg_data = json.load(f)
    
    cursor = conn.cursor()
    
    # Map payer entity IDs to short payer IDs
    payer_id_map = {
        "PAYER_UHC": "uhc",
        "PAYER_HUMANA": "humana",
        "PAYER_BCBS": "bcbs",
        "PAYER_AETNA": "aetna",
        "PAYER_CIGNA": "cigna",
        "PAYER_MEDICARE": "medicare"
    }
    
    # Load entities as nodes
    entities = kg_data.get("entities", [])
    for entity in entities:
        node_id = entity.get("entity_id")
        node_type = entity.get("entity_type")
        name = entity.get("name")
        attributes = json.dumps(entity.get("attributes", {}))
        
        # Determine payer_id based on entity
        payer_id = None
        if node_type == "Payer":
            payer_id = payer_id_map.get(node_id)
        elif node_type == "Policy":
            # Extract payer from policy ID prefix
            if node_id.startswith("UHC-"):
                payer_id = "uhc"
            elif node_id.startswith("HUM-"):
                payer_id = "humana"
            elif node_id.startswith("FLB-"):
                payer_id = "bcbs"
            elif node_id.startswith("AET-"):
                payer_id = "aetna"
            elif node_id.startswith("CIG-"):
                payer_id = "cigna"
            elif node_id.startswith("CMS-"):
                payer_id = "medicare"
        
        cursor.execute(
            "INSERT OR REPLACE INTO kg_nodes (node_id, node_type, name, payer_id, attributes) VALUES (?, ?, ?, ?, ?)",
            (node_id, node_type, name, payer_id, attributes)
        )
    
    print(f"Loaded {len(entities)} entities")
    
    # Load relationships as edges
    relationships = kg_data.get("relationships", [])
    for rel in relationships:
        edge_id = rel.get("relationship_id")
        source_id = rel.get("source_entity")
        target_id = rel.get("target_entity")
        edge_type = rel.get("relationship_type")
        attributes = json.dumps(rel.get("attributes", {}))
        
        cursor.execute(
            "INSERT OR REPLACE INTO kg_edges (edge_id, source_id, target_id, edge_type, attributes) VALUES (?, ?, ?, ?, ?)",
            (edge_id, source_id, target_id, edge_type, attributes)
        )
    
    print(f"Loaded {len(relationships)} relationships")
    conn.commit()

def load_text_chunks(conn: sqlite3.Connection):
    """Load text chunks for retrieval."""
    chunks_path = POLICY_DOCS_DIR / "text_chunks.json"
    
    with open(chunks_path, 'r') as f:
        chunks_data = json.load(f)
    
    cursor = conn.cursor()
    
    for chunk in chunks_data:
        chunk_id = chunk.get("chunk_id")
        doc_id = chunk.get("source_id")  # Map source_id to doc_id
        payer_id = chunk.get("payer_id")
        doc_type = chunk.get("source_type") or chunk.get("chunk_type")  # Map source_type to doc_type
        title = chunk.get("chunk_type", "")  # Use chunk_type as title
        content = chunk.get("text")  # Map text to content
        metadata = json.dumps(chunk.get("metadata", {}))
        
        cursor.execute(
            "INSERT OR REPLACE INTO kg_chunks (chunk_id, doc_id, payer_id, doc_type, title, content, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (chunk_id, doc_id, payer_id, doc_type, title, content, metadata)
        )
    
    print(f"Loaded {len(chunks_data)} text chunks")
    conn.commit()

def load_policies(conn: sqlite3.Connection):
    """Load full policy documents."""
    policies_path = POLICY_DOCS_DIR / "medical_policies.json"
    
    with open(policies_path, 'r') as f:
        policies_data = json.load(f)
    
    cursor = conn.cursor()
    
    for policy in policies_data:
        policy_id = policy.get("policy_id")
        payer_id = policy.get("payer_id")
        payer_name = policy.get("payer_name")
        policy_type = policy.get("policy_type")
        title = policy.get("title")
        effective_date = policy.get("effective_date")
        version = policy.get("version")
        status = policy.get("status")
        summary = policy.get("summary")
        full_text = policy.get("full_text", "")
        applicable_cpt_codes = json.dumps(policy.get("applicable_cpt_codes", []))
        tags = json.dumps(policy.get("tags", []))
        
        cursor.execute(
            """INSERT OR REPLACE INTO kg_policies 
               (policy_id, payer_id, payer_name, policy_type, title, effective_date, version, status, summary, full_text, applicable_cpt_codes, tags) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (policy_id, payer_id, payer_name, policy_type, title, effective_date, version, status, summary, full_text, applicable_cpt_codes, tags)
        )
    
    print(f"Loaded {len(policies_data)} policies")
    conn.commit()

def main():
    print(f"Loading knowledge graph into {DB_PATH}")
    
    conn = sqlite3.connect(str(DB_PATH))
    
    try:
        create_kg_tables(conn)
        load_knowledge_graph(conn)
        load_text_chunks(conn)
        load_policies(conn)
        
        # Verify counts
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM kg_nodes")
        print(f"Total nodes: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM kg_edges")
        print(f"Total edges: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM kg_chunks")
        print(f"Total chunks: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM kg_policies")
        print(f"Total policies: {cursor.fetchone()[0]}")
        
        print("\nKnowledge graph loaded successfully!")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()
