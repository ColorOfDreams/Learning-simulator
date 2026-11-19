import importlib.util
from pathlib import Path
import tempfile
import unittest


spec = importlib.util.spec_from_file_location('migration', Path(__file__).with_name('prepare-supabase-dump.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DumpRemappingTests(unittest.TestCase):
    def test_schema_vector_and_sequence_references_change_but_copy_data_does_not(self):
        sql = '''CREATE SCHEMA "public";
CREATE TABLE "public"."items" ("embedding" "public"."vector"(3));
ALTER TABLE "public"."items" ALTER COLUMN "id" SET DEFAULT nextval('public.items_id_seq'::regclass);
COPY "public"."items" ("text") FROM stdin;
"public"."items" and public.items in a user message must stay verbatim
\\.
CREATE INDEX "index" ON "public"."items" ("id");
'''
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'source.sql'
            destination = Path(directory) / 'target.sql'
            source.write_text(sql, encoding='utf-8')
            module.remap_dump(source, destination)
            result = destination.read_text(encoding='utf-8')
            self.assertIn('CREATE SCHEMA "scilab";', result)
            self.assertIn('"extensions"."vector"(3)', result)
            self.assertIn("nextval('scilab.items_id_seq'", result)
            self.assertIn('"public"."items" and public.items in a user message must stay verbatim', result)
            self.assertIn('CREATE INDEX "index" ON "scilab"."items"', result)
            with self.assertRaises(FileExistsError):
                module.remap_dump(source, destination)


if __name__ == '__main__':
    unittest.main()
