-- Seed data for major military hubs and strategic locations worldwide

INSERT INTO nexus_points (name, description, latitude, longitude, status) VALUES
-- United States Major Military Bases
('Pentagon', 'Department of Defense Headquarters, Arlington, Virginia', 38.8718, -77.0563, 'green'),
('Cheyenne Mountain', 'NORAD Command Center, Colorado Springs', 38.7406, -104.8456, 'green'),
('Wright-Patterson AFB', 'Air Force Materiel Command HQ, Dayton, Ohio', 39.8264, -84.0482, 'green'),
('Ramstein Air Base', 'US Air Forces Europe HQ, Germany', 49.4369, 7.6003, 'green'),
('Incirlik Air Base', 'NATO Strategic Base, Turkey', 37.0021, 35.4259, 'yellow'),
('Guantanamo Bay', 'Naval Base, Cuba', 19.9067, -75.0847, 'green'),
('Norfolk Naval Base', 'World''s Largest Naval Station, Virginia', 36.9467, -76.3284, 'green'),
('Camp Pendleton', 'Marine Corps Base, California', 33.3806, -117.3439, 'green'),
('Fort Bragg', 'Army Installation, North Carolina', 35.1413, -79.0063, 'green'),
('MacDill AFB', 'CENTCOM Headquarters, Florida', 27.8492, -82.5211, 'green'),

-- NATO Allied Bases
('RAF Lakenheath', 'US Air Force Base, United Kingdom', 52.4093, 0.5610, 'green'),
('Thule Air Base', 'Early Warning System, Greenland', 76.5311, -68.7030, 'green'),
('Diego Garcia', 'Joint UK-US Base, Indian Ocean', -7.3067, 72.4111, 'green'),
('Yokosuka Naval Base', 'US Navy Base, Japan', 35.2944, 139.6611, 'green'),
('Kadena Air Base', 'Strategic Air Base, Okinawa, Japan', 26.3558, 127.7678, 'green'),

-- Strategic International Locations
('Pine Gap', 'Joint Intelligence Facility, Australia', -23.7989, 133.7378, 'green'),
('Bagram Airfield', 'Former Strategic Base, Afghanistan', 34.9461, 69.2650, 'red'),
('Al Udeid Air Base', 'Forward Operating Base, Qatar', 25.1175, 51.3150, 'green'),
('Camp Arifjan', 'Army Base, Kuwait', 29.0936, 47.6769, 'green'),
('Djibouti Base', 'Camp Lemonnier, Horn of Africa', 11.5450, 43.1586, 'green'),

-- Early Warning Systems
('Fylingdales', 'Ballistic Missile Early Warning, UK', 54.3558, -0.6717, 'green'),
('Clear AFS', 'Ballistic Missile Early Warning, Alaska', 64.2925, -149.1897, 'green'),
('Beale AFB', 'Strategic Reconnaissance, California', 39.1361, -121.4369, 'green'),
('Offutt AFB', 'Strategic Air Command, Nebraska', 41.1181, -95.9156, 'green'),

-- Pacific Strategic Points
('Andersen AFB', 'Strategic Bomber Base, Guam', 13.5839, 144.9306, 'green'),
('Pearl Harbor', 'Pacific Fleet HQ, Hawaii', 21.3556, -157.9750, 'green'),
('Hickam AFB', 'Pacific Air Forces, Hawaii', 21.3186, -157.9386, 'green'),

-- Additional Strategic Locations
('Vandenberg SFB', 'Space Force Base, California', 34.7420, -120.5724, 'green'),
('Schriever SFB', 'Space Operations Center, Colorado', 38.8031, -104.5267, 'green'),
('Peterson SFB', 'Space Command, Colorado Springs', 38.8125, -104.7006, 'green'),
('Malmstrom AFB', 'Nuclear Missile Wing, Montana', 47.5028, -111.1886, 'green'),
('Minot AFB', 'Nuclear Operations, North Dakota', 48.4156, -101.3578, 'green'),
('F.E. Warren AFB', 'Nuclear Missile Operations, Wyoming', 41.1575, -104.8667, 'green'),
('Whiteman AFB', 'Stealth Bomber Base, Missouri', 38.7306, -93.5478, 'green'),

-- International Monitoring Stations
('Menwith Hill', 'Intelligence Gathering, UK', 54.0092, -1.6919, 'green'),
('Misawa Air Base', 'Intelligence Operations, Japan', 40.7031, 141.3686, 'green'),
('Osan Air Base', 'Strategic Air Base, South Korea', 37.0906, 127.0297, 'yellow'),
('Kunsan Air Base', 'Fighter Wing Base, South Korea', 35.9036, 126.6156, 'yellow');