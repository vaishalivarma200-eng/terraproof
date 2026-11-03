import sqlite3
import os

db_path = r"C:\Users\Vaishali\.gemini\antigravity\scratch\terraproof\backend\terraproof.db"
print("Database path:", db_path)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cur.fetchall()
    print("\n=== SQL Tables & Record Counts in terraproof.db ===")
    for (t_name,) in tables:
        cur.execute(f"SELECT COUNT(*) FROM '{t_name}'")
        count = cur.fetchone()[0]
        print(f"  • Table: {t_name:<28} | Rows: {count}")
    
    # Sample claims
    print("\n=== SQL Records from 'claims' table ===")
    cur.execute("SELECT reference_no, farmer_name, crop_type, claimed_area_ha, damage_type, status, khasra_no, masked_aadhaar_ref FROM claims")
    rows = cur.fetchall()
    for r in rows:
        print(f"  - Ref: {r[0]:<14} | Farmer: {r[1]:<18} | Crop: {r[2]:<8} | Area: {r[3]:<4} ha | Peril: {r[4]:<8} | Status: {r[5]:<18} | Khasra: {r[6]:<6} | Aadhaar: {r[7]}")

    # Check AnalysisJob table
    print("\n=== SQL Records from 'analysis_jobs' table ===")
    cur.execute("SELECT id, claim_id, analysis_type, status, integrity_hash FROM analysis_jobs LIMIT 5")
    rows = cur.fetchall()
    for r in rows:
        print(f"  - Job: {r[0][:18]}... | Claim: {r[1][:12]}... | Type: {r[2]:<22} | Status: {r[3]:<10} | Hash: {str(r[4])[:24]}...")

    # Check Audit table
    print("\n=== SQL Records from 'audit_blocks' table ===")
    cur.execute("SELECT block_index, event_type, record_id, actor, block_hash FROM audit_blocks ORDER BY block_index DESC LIMIT 5")
    rows = cur.fetchall()
    for r in rows:
        print(f"  - Block #{r[0]}: {r[1]:<28} | ID: {r[2]:<12} | Actor: {r[3][:20]:<20} | Hash: {r[4][:20]}...")

    conn.close()
else:
    print("terraproof.db not found at", db_path)

