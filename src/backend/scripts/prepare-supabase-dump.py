"""Remap a trusted pg_dump SQL export without touching COPY payloads.

Run pg_dump with --quote-all-identifiers --no-owner --no-privileges --schema=public.
The destination is a new, empty, private application schema. This script never
connects to a database and does not contain credentials.
"""
import argparse
from pathlib import Path
import re


def remap_dump(source: Path, destination: Path, schema: str = "scilab") -> None:
    if not re.fullmatch(r"[a-z_][a-z0-9_]*", schema):
        raise ValueError("Destination schema must be a lowercase PostgreSQL identifier")
    if destination.exists():
        raise FileExistsError(destination)
    in_copy = False
    with source.open(encoding="utf-8") as src, destination.open("x", encoding="utf-8", newline="\n") as dst:
        for line in src:
            if in_copy:
                dst.write(line)
                if line.rstrip("\r\n") == r"\.":
                    in_copy = False
                continue
            # Extensions belong to Supabase's extensions schema, not app tables.
            line = line.replace('"public"."vector"', '"extensions"."vector"')
            line = line.replace('"public"."uuid_generate_v4"', '"extensions"."uuid_generate_v4"')
            line = line.replace('"public".', f'"{schema}".')
            line = line.replace("'public.", f"'{schema}.")
            line = re.sub(r'^(CREATE SCHEMA(?: IF NOT EXISTS)? )"public";', rf'\1"{schema}";', line)
            dst.write(line)
            if line.startswith('COPY ') and line.rstrip().endswith('FROM stdin;'):
                in_copy = True
    if in_copy:
        raise ValueError("Incomplete COPY payload in database dump")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--schema", default="scilab")
    args = parser.parse_args()
    remap_dump(args.source, args.destination, args.schema)
