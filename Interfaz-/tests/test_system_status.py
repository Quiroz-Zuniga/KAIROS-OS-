import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('system_status', Path(__file__).parents[1] / 'scripts/system_status.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class StatusTests(unittest.TestCase):
    def test_nmcli_escaped_names_and_strongest_access_point(self):
        networks = module.parse_networks('*:UPHOS\\:Lab:80:WPA2\n:Biblioteca:20:WPA2\n:Biblioteca:70:WPA2\n:Abierta:40:--')
        self.assertEqual(networks[0]['ssid'], 'UPHOS:Lab')
        self.assertTrue(networks[0]['connected'])
        self.assertEqual(networks[1]['signal'], 70)
        self.assertFalse(networks[2]['secure'])

    def test_battery_reads_fixture_without_touching_real_sysfs(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            battery = root / 'BAT0'
            battery.mkdir()
            for name, value in {'type':'Battery', 'capacity':'73', 'status':'Charging'}.items():
                (battery / name).write_text(value)
            state = module.battery_status(root)
            self.assertEqual(state['level'], 73)
            self.assertTrue(state['charging'])
            self.assertTrue(state['plugged'])

    def test_no_battery_is_unavailable_not_fake_full_charge(self):
        with tempfile.TemporaryDirectory() as directory:
            self.assertFalse(module.battery_status(Path(directory))['available'])

    def test_bad_network_records_are_ignored(self):
        self.assertEqual(module.parse_networks(':Oculta:no-data:WPA2\n:sin señal:abc:--'), [])

if __name__ == '__main__':
    unittest.main()
