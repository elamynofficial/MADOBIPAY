INSERT INTO electricity_providers (code, name, state) VALUES
('ikedc','IKEDC','Lagos'),
('ekedc','EKEDC','Lagos'),
('aedc','AEDC','Abuja'),
('kedco','KEDCO','Kano'),
('jed','JED','Jos'),
('phed','PHED','Port Harcourt'),
('eedc','EEDC','Enugu'),
('ibedc','IBEDC','Ibadan'),
('bedc','BEDC','Benin'),
('yedc','YEDC','Yola'),
('kaedco','KAEDCO','Kaduna')
ON CONFLICT (code) DO NOTHING;

INSERT INTO settings (key, value) VALUES
('brand', '{"name":"MADOBIPAY","tagline":"Fast, Secure & Reliable Digital Payments"}'),
('limits', '{"airtimeMaxKobo":5000000,"transferMaxKobo":100000000}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
