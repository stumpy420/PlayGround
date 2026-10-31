export const VERSION = 3;

export const DISTRICTS = [
  { id:'downtown', name:'DOWNTOWN', sub:'RAILROAD AVE', x:0, z:20, r:120, color:'#ffb35c' },
  { id:'waterfront', name:'WATERFRONT', sub:'BELLINGHAM BAY', x:0, z:215, r:115, color:'#7fe3d2' },
  { id:'fairhaven', name:'FAIRHAVEN', sub:'OLD TOWN', x:-164, z:148, r:95, color:'#e2a37d' },
  { id:'campus', name:'SEHOME / CAMPUS', sub:'WESTERN WASHINGTON', x:-205, z:-148, r:105, color:'#b6c57d' },
  { id:'falls', name:'WHATCOM FALLS', sub:'CEDAR HOLLOW', x:228, z:-112, r:100, color:'#86c68f' },
  { id:'lake', name:'LAKE WHATCOM', sub:'MIRROR WATER', x:304, z:52, r:110, color:'#78b8cf' },
  { id:'chuckanut', name:'CHUCKANUT', sub:'COASTAL RANGE', x:-238, z:272, r:130, color:'#6e9d7e' },
  { id:'industrial', name:'INDUSTRIAL', sub:'TERMINAL DISTRICT', x:150, z:-130, r:100, color:'#c49b65' },
  { id:'residential', name:'LETTERED STREETS', sub:'NORTH SIDE', x:-94, z:92, r:85, color:'#d3c27f' },
  { id:'hills', name:'SOUTH HILL', sub:'VIEWS OF THE BAY', x:110, z:140, r:95, color:'#c2a87f' }
];

export const BUSINESSES = [
  { id:'harborview', name:'Harborview Lofts', short:'HARBORVIEW', type:'home', x:-42, z:46, w:22, d:18, h:24, entry:{x:-42,z:58}, sign:'HARBORVIEW LOFTS', color:'#414d4d', accent:'#7fe3d2', desc:'A creaking brick walk-up with a view of somebody else’s boat.' },
  { id:'steam_kettle', name:'The Steam Kettle', short:'STEAM KETTLE', type:'cafe', x:14, z:38, w:18, d:14, h:10, entry:{x:14,z:48}, sign:'THE STEAM KETTLE', color:'#3d2f28', accent:'#ffb35c', desc:'Coffee, pastries, and a barista who moves like a rumor.' },
  { id:'drowned_raven', name:'The Drowned Raven', short:'DROWNED RAVEN', type:'bar', x:-50, z:24, w:20, d:15, h:13, entry:{x:-50,z:34}, sign:'THE DROWNED RAVEN', color:'#262d2e', accent:'#ff4338', desc:'Dim booths, local cider, and a jukebox that knows too much.' },
  { id:'north_sound', name:'North Sound Strength', short:'NORTH SOUND', type:'gym', x:34, z:28, w:22, d:16, h:15, entry:{x:34,z:39}, sign:'NORTH SOUND STRENGTH', color:'#293331', accent:'#7fe3d2', desc:'Chalk, iron, and a trainer who never blinks first.' },
  { id:'static_club', name:'STATIC', short:'STATIC', type:'club', x:80, z:56, w:24, d:18, h:18, entry:{x:80,z:68}, sign:'S T A T I C', color:'#211c29', accent:'#d9a6ff', desc:'A basement club with bad wiring and excellent trouble.' },
  { id:'cascadia_ink', name:'Cascadia Ink', short:'CASCADIA INK', type:'tattoo', x:-88, z:56, w:17, d:13, h:9, entry:{x:-88,z:66}, sign:'CASCADIA INK', color:'#34302a', accent:'#ff4338', desc:'Tattoos, piercings, and a back room that smells like ozone.' },
  { id:'second_rain', name:'Second Rain', short:'SECOND RAIN', type:'clothing', x:-28, z:80, w:18, d:13, h:9, entry:{x:-28,z:90}, sign:'SECOND RAIN', color:'#2a3134', accent:'#e9e4d8', desc:'Vintage rainwear and clothes that remember other bodies.' },
  { id:'salt_cedar', name:'Salt & Cedar', short:'SALT & CEDAR', type:'restaurant', x:-22, z:2, w:20, d:14, h:11, entry:{x:-22,z:12}, sign:'SALT & CEDAR', color:'#332a23', accent:'#ffb35c', desc:'Local fish, cedar-plank everything, and candles that won’t stay lit.' },
  { id:'pigeon_mart', name:'Pigeon Mart', short:'PIGEON MART', type:'store', x:-84, z:16, w:16, d:12, h:8, entry:{x:-84,z:26}, sign:'PIGEON MART', color:'#3d4135', accent:'#ffb35c', desc:'Open 24 hours. The fluorescent lights never quite turn off.' },
  { id:'free_clinic', name:'Bellingham Free Clinic', short:'FREE CLINIC', type:'clinic', x:76, z:2, w:20, d:15, h:12, entry:{x:76,z:12}, sign:'FREE CLINIC', color:'#3a4342', accent:'#7fe3d2', desc:'Patch-up, prescriptions, and questions nobody answers.' },
  { id:'lucky_nickel', name:'Lucky Nickel Pawn', short:'LUCKY NICKEL', type:'pawn', x:28, z:-38, w:18, d:14, h:10, entry:{x:28,z:-28}, sign:'LUCKY NICKEL', color:'#3e3528', accent:'#ffb35c', desc:'Cash for your past. No questions, mostly.' },
  { id:'city_hall', name:'Bellingham City Hall', short:'CITY HALL', type:'cityhall', x:-108, z:-16, w:26, d:18, h:19, entry:{x:-108,z:-4}, sign:'CITY HALL', color:'#464b49', accent:'#e9e4d8', desc:'Marble, microphones, and a mayor with a voice like a permit denial.' },
  { id:'transit', name:'WTA Transit Center', short:'TRANSIT', type:'transit', x:-16, z:-68, w:26, d:16, h:10, entry:{x:-16,z:-56}, sign:'TRANSIT CENTER', color:'#2f3b3b', accent:'#7fe3d2', desc:'Buses arrive. Buses leave. One bus does neither.' },
  { id:'terminal9', name:'Terminal 9', short:'TERMINAL 9', type:'arena', x:184, z:-206, w:36, d:28, h:20, entry:{x:184,z:-190}, sign:'TERMINAL 9', color:'#262a2c', accent:'#ff4338', desc:'A warehouse that isn’t on the port authority’s map.' },
  { id:'cormorant', name:'Cormorant Marina', short:'CORMORANT', type:'marina', x:18, z:216, w:26, d:14, h:9, entry:{x:18,z:205}, sign:'CORMORANT MARINA', color:'#2b3b3c', accent:'#7fe3d2', desc:'Salt-eaten docks and a ferryman who is always already there.' },
  { id:'boulevard', name:'Boulevard Park', short:'BOULEVARD PARK', type:'park', x:-112, z:180, w:42, d:30, h:0, entry:{x:-112,z:166}, sign:'BOULEVARD PARK', color:'#2f4636', accent:'#86c68f', desc:'A boardwalk over the bay. In storms, the water climbs the pilings.' },
  { id:'raven_books', name:'Raven & Salt Books', short:'RAVEN & SALT', type:'bookstore', x:-166, z:140, w:20, d:14, h:12, entry:{x:-166,z:151}, sign:'RAVEN & SALT BOOKS', color:'#3b2d2b', accent:'#e2a37d', desc:'Used books, local zines, and a back shelf that rearranges itself.' },
  { id:'fairhaven_bar', name:'The Salty Otter', short:'SALTY OTTER', type:'bar', x:-188, z:164, w:18, d:14, h:10, entry:{x:-188,z:174}, sign:'THE SALTY OTTER', color:'#2d3633', accent:'#ffb35c', desc:'Fairhaven’s oldest bar. The regulars have regulars.' },
  { id:'campus_union', name:'Viking Union', short:'VIKING UNION', type:'campus', x:-204, z:-146, w:32, d:20, h:16, entry:{x:-204,z:-134}, sign:'VIKING UNION', color:'#4a3d36', accent:'#b6c57d', desc:'Cheap noodles, loud opinions, and a dojo in the sub-basement.' },
  { id:'empty_cup', name:'Empty Cup Dojo', short:'EMPTY CUP', type:'dojo', x:-158, z:-108, w:18, d:14, h:11, entry:{x:-158,z:-98}, sign:'EMPTY CUP DOJO', color:'#34362e', accent:'#d9a6ff', desc:'A sign says “BEGINNERS WELCOME.” The floor says otherwise.' },
  { id:'falls_trail', name:'Cedar Hollow Trailhead', short:'CEDAR HOLLOW', type:'trail', x:230, z:-118, w:16, d:12, h:7, entry:{x:230,z:-106}, sign:'CEDAR HOLLOW TRAIL', color:'#28362b', accent:'#86c68f', desc:'Moss, mud, and a waterfall that sounds like applause.' },
  { id:'mirror_lake', name:'Mirror Lake Dock', short:'MIRROR LAKE', type:'lake', x:300, z:54, w:20, d:10, h:4, entry:{x:300,z:66}, sign:'MIRROR LAKE', color:'#2a393d', accent:'#78b8cf', desc:'The lake is very still. Your reflection is not.' },
  { id:'chuckanut_trail', name:'Chuckanut Ridge Trail', short:'CHUCKANUT', type:'trail', x:-238, z:272, w:14, d:10, h:6, entry:{x:-238,z:260}, sign:'CHUCKANUT RIDGE', color:'#273429', accent:'#6e9d7e', desc:'Switchbacks, sword ferns, and the feeling of being followed.' },
  { id:'junk_yard', name:'Rook’s Salvage', short:'ROOK’S SALVAGE', type:'junkyard', x:140, z:-108, w:28, d:22, h:8, entry:{x:140,z:-96}, sign:'ROOK’S SALVAGE', color:'#3b352b', accent:'#ffb35c', desc:'A graveyard of cars and one very alive mechanic.' },
  { id:'rainier_motel', name:'Rainier Motor Lodge', short:'RAINIER MOTEL', type:'motel', x:120, z:-56, w:30, d:12, h:10, entry:{x:120,z:-44}, sign:'RAINIER MOTOR LODGE', color:'#3a3432', accent:'#ff4338', desc:'Vacancy. Always vacancy.' },
  { id:'radio', name:'KAVX Community Radio', short:'KAVX 88.1', type:'radio', x:60, z:-98, w:18, d:14, h:12, entry:{x:60,z:-86}, sign:'KAVX 88.1', color:'#2e3538', accent:'#7fe3d2', desc:'A transmitter on the hill that sometimes broadcasts tomorrow.' },
  { id:'old_park', name:'Elizabeth Park', short:'ELIZABETH PARK', type:'park', x:-52, z:-76, w:34, d:26, h:0, entry:{x:-52,z:-62}, sign:'ELIZABETH PARK', color:'#304633', accent:'#86c68f', desc:'A green square with a gazebo and an old man who is never cold.' },
  { id:'pier', name:'Cormorant Pier', short:'THE PIER', type:'pier', x:0, z:230, w:12, d:26, h:2, entry:{x:0,z:216}, sign:'CORMORANT PIER', color:'#2f3b3c', accent:'#7fe3d2', desc:'The end of the boardwalk. The beginning of something else.' }
];

export const ITEMS = {
  coffee:{name:'Rain City Drip', type:'drink', price:5, desc:'Bitter, hot, honest.', effects:{energy:22,mood:4}},
  pastry:{name:'Cardamom Knot', type:'food', price:7, desc:'Still warm. Somehow.', effects:{hunger:24,mood:5}},
  sandwich:{name:'Cedar Smoked Turkey', type:'food', price:12, desc:'A very serious sandwich.', effects:{hunger:46,mood:6}},
  ramen:{name:'Late Night Ramen', type:'food', price:10, desc:'The broth has seen things.', effects:{hunger:40,energy:6,mood:3}},
  beer:{name:'Harbor Ale', type:'drink', price:8, desc:'Local. Hazy. Dangerous in numbers.', effects:{mood:10,energy:-4,intoxication:18}},
  cider:{name:'Dry Apple Cider', type:'drink', price:9, desc:'A pint of autumn.', effects:{mood:9,energy:-3,intoxication:15}},
  whiskey:{name:'Railroad Whiskey', type:'drink', price:12, desc:'A bad idea with a good finish.', effects:{mood:14,energy:-6,intoxication:28}},
  joint:{name:'Chuckanut Green', type:'drug', price:15, desc:'Fictional, local, and probably not what you think.', effects:{mood:18,energy:-8,hunger:8,intoxication:10}},
  pills:{name:'Unlabeled Pills', type:'drug', price:28, desc:'Someone wrote “FOR THE RAIN” on the bottle.', effects:{mood:20,energy:15,health:-12,intoxication:20}},
  firstaid:{name:'First Aid Kit', type:'heal', price:22, desc:'Gauze, tape, and a little prayer.', effects:{health:38}},
  energy_drink:{name:'Static Lemonade', type:'drink', price:6, desc:'Tastes like a screensaver.', effects:{energy:30,mood:-2}},
  umbrella:{name:'Broken Umbrella', type:'misc', price:4, desc:'The wind has opinions.', effects:{}},
  token:{name:'Brass Bus Token', type:'artifact', price:0, desc:'No route number. No expiry.', effects:{}},
  raincoat_button:{name:'Raincoat Button', type:'artifact', price:0, desc:'Yellow plastic. Warm to the touch.', effects:{}},
  mirror_shard:{name:'Mirror Shard', type:'artifact', price:0, desc:'It reflects a room you have not entered.', effects:{}},
  ring:{name:'Rain Ring', type:'gift', price:90, desc:'A silver band with a tiny storm cloud etched into it.', effects:{}},
  flowers:{name:'Cedar & Fern Bouquet', type:'gift', price:38, desc:'The florist wrapped it in yesterday’s newspaper.', effects:{}},
  book:{name:'The Quiet Architecture', type:'gift', price:24, desc:'A novel about a city that edits itself.', effects:{}},
  cassette:{name:'Unmarked Cassette', type:'artifact', price:0, desc:'Side A: rain. Side B: your name.', effects:{}}
};

export const NPCS = [
  {
    id:'mara', name:'Mara Voss', age:25, role:'Barista', tag:'BARISTA', district:'downtown',
    home:{x:-32,z:84}, work:{x:14,z:45}, schedule:[{h:6,at:'work'},{h:14,at:'home'},{h:19,at:'bar'},{h:23,at:'home'}],
    palette:{skin:'#b98b6e',shirt:'#7a4b3b',pants:'#25282b',hair:'#201b1b',accent:'#ffb35c'},
    height:1.68, romanceable:true, fighter:true, boss:'barista',
    intro:'She wipes the same clean spot on the counter. Her eyes track your hands, not your face.',
    secret:'Moves faster than the espresso machine. Says “ROUND ONE” like it is a weather report.',
    likes:['coffee','dark humor','rain'], dislikes:['being late','small talk']
  },
  {
    id:'elias', name:'Elias Crane', age:44, role:'Ferryman', tag:'FERRYMAN', district:'waterfront',
    home:{x:44,z:226}, work:{x:18,z:202}, schedule:[{h:5,at:'work'},{h:16,at:'bar'},{h:22,at:'home'}],
    palette:{skin:'#8d6b58',shirt:'#1f3539',pants:'#1c2428',hair:'#4d4d4a',accent:'#7fe3d2'},
    height:1.84, romanceable:false, fighter:true, boss:'ferryman',
    intro:'He smells like salt and old rope. The tide moves around him, not with him.',
    secret:'The bay does what he asks. He asks rarely, and never nicely.',
    likes:['silence','the tide','cigarettes'], dislikes:['landlubbers','questions']
  },
  {
    id:'juniper', name:'Juniper Reed', age:29, role:'Trail Guide', tag:'HIKER', district:'falls',
    home:{x:246,z:-86}, work:{x:230,z:-104}, schedule:[{h:7,at:'work'},{h:17,at:'lake'},{h:21,at:'home'}],
    palette:{skin:'#c49b7b',shirt:'#4e5d3d',pants:'#2c3029',hair:'#6b3f2b',accent:'#86c68f'},
    height:1.72, romanceable:true, fighter:true, boss:'hiker',
    intro:'Mud on her boots. A climbing rope coiled like a sleeping snake. She smiles like she knows where you live.',
    secret:'Fights with roots, stones, and the patience of a forest.',
    likes:['moss','dogs','altitude'], dislikes:['litter','roads']
  },
  {
    id:'rook', name:'Rook Delgado', age:33, role:'Mechanic', tag:'MECHANIC', district:'industrial',
    home:{x:158,z:-84}, work:{x:140,z:-94}, schedule:[{h:8,at:'work'},{h:18,at:'bar'},{h:23,at:'home'}],
    palette:{skin:'#a8795f',shirt:'#38424a',pants:'#22272b',hair:'#171b1d',accent:'#ffb35c'},
    height:1.79, romanceable:true, fighter:true, boss:'mechanic',
    intro:'Grease under her nails. A wrench in her back pocket like other people carry phones.',
    secret:'Weapons are everywhere if you know which parts to remove.',
    likes:['engines','loud music','honesty'], dislikes:['warranties','suits']
  },
  {
    id:'aiko', name:'Aiko Tan', age:21, role:'Student', tag:'STUDENT', district:'campus',
    home:{x:-188,z:-168}, work:{x:-204,z:-140}, schedule:[{h:8,at:'work'},{h:16,at:'dojo'},{h:21,at:'home'}],
    palette:{skin:'#c8a27e',shirt:'#e9e4d8',pants:'#2b3032',hair:'#1b1b1e',accent:'#d9a6ff'},
    height:1.62, romanceable:true, fighter:true, boss:'student',
    intro:'She has three highlighters and the posture of someone who has already won.',
    secret:'Studies architecture by day, breaks it by night.',
    likes:['patterns','late nights','competence'], dislikes:['condescension','group projects']
  },
  {
    id:'august', name:'August Bell', age:78, role:'Retired', tag:'OLD MAN AT THE PARK', district:'downtown',
    home:{x:-60,z:-84}, work:{x:-52,z:-70}, schedule:[{h:7,at:'work'},{h:12,at:'work'},{h:19,at:'home'}],
    palette:{skin:'#9b745f',shirt:'#4b453a',pants:'#30302b',hair:'#d6d0c4',accent:'#e9e4d8'},
    height:1.7, romanceable:false, fighter:true, boss:'oldman',
    intro:'He feeds pigeons that are not there. He looks at you like he remembers your funeral.',
    secret:'The oldest fighter in the city. The city has not forgiven him for it.',
    likes:['pigeons','chess','silence'], dislikes:['rushing','loud cars']
  },
  {
    id:'raincoat', name:'The Raincoat', age:38, role:'???', tag:'RAINCOAT', district:'waterfront',
    home:{x:-112,z:190}, work:{x:0,z:226}, schedule:[{h:0,at:'work'},{h:23,at:'work'}],
    palette:{skin:'#5d5f5e',shirt:'#d9b93b',pants:'#2b2c27',hair:'#222',accent:'#ff4338'},
    height:1.76, romanceable:false, fighter:true, boss:'raincoat',
    intro:'A yellow raincoat with nobody clearly inside it. Rain bends away from the hood.',
    secret:'Appears when the barometer breaks. Leaves when you remember to breathe.',
    likes:['storms','static','being elsewhere'], dislikes:['forecasts','dry rooms']
  },
  {
    id:'celeste', name:'Celeste Ward', age:52, role:'Mayor', tag:'MAYOR', district:'downtown',
    home:{x:-126,z:-34}, work:{x:-108,z:-8}, schedule:[{h:7,at:'work'},{h:18,at:'club'},{h:22,at:'home'}],
    palette:{skin:'#c4a083',shirt:'#2b3444',pants:'#24272c',hair:'#7d7d78',accent:'#ff4338'},
    height:1.66, romanceable:false, fighter:true, boss:'mayor',
    intro:'A perfect smile, a perfect suit, and a microphone clipped to her collar at all times.',
    secret:'Every speech is a weapon. Every policy is a feint.',
    likes:['approval','microphones','order'], dislikes:['questions','rain']
  },
  {
    id:'mirror', name:'The Mirror', age:27, role:'???', tag:'MIRROR', district:'lake',
    home:{x:300,z:54}, work:{x:300,z:54}, schedule:[{h:0,at:'work'},{h:23,at:'work'}],
    palette:{skin:'#c9d3d2',shirt:'#8e9997',pants:'#505c5b',hair:'#c9d3d2',accent:'#7fe3d2'},
    height:1.76, romanceable:false, fighter:true, boss:'mirror',
    intro:'It wears your jacket. It has your posture. Its face is a little too smooth.',
    secret:'It copies what it sees. It has been watching you for longer than you think.',
    likes:['imitation','still water','your habits'], dislikes:['originality','broken mirrors']
  },
  {
    id:'future', name:'The Future Player', age:31, role:'???', tag:'FUTURE PLAYER', district:'industrial',
    home:{x:184,z:-206}, work:{x:184,z:-206}, schedule:[{h:0,at:'work'},{h:23,at:'work'}],
    palette:{skin:'#9d8b7d',shirt:'#15191b',pants:'#0c1011',hair:'#e9e4d8',accent:'#ff4338'},
    height:1.82, romanceable:false, fighter:true, boss:'future',
    intro:'Your face, older. Your scars, rearranged. A name tag that says YOU.',
    secret:'They have played this city before. They remember every choice you have not made yet.',
    likes:['completion','foresight','you'], dislikes:['surprises','mercy']
  },
  {
    id:'nadia', name:'Nadia Okafor', age:31, role:'Bookshop Owner', tag:'BOOKS', district:'fairhaven',
    home:{x:-148,z:128}, work:{x:-166,z:148}, schedule:[{h:9,at:'work'},{h:18,at:'bar'},{h:22,at:'home'}],
    palette:{skin:'#8c5e46',shirt:'#6d4f3d',pants:'#2b2d2c',hair:'#211917',accent:'#e2a37d'},
    height:1.7, romanceable:true, fighter:false,
    intro:'She reads three books at once and somehow knows when you are lying.',
    secret:'Keeps a ledger of everyone who has ever asked about the underground.',
    likes:['marginalia','rain','tea'], dislikes:['dog-ears','certainty']
  },
  {
    id:'theo', name:'Theo Marsh', age:36, role:'Bartender', tag:'BARTENDER', district:'downtown',
    home:{x:-62,z:40}, work:{x:-50,z:31}, schedule:[{h:16,at:'work'},{h:2,at:'home'}],
    palette:{skin:'#b58a6c',shirt:'#2b3532',pants:'#1f2324',hair:'#3a2b22',accent:'#ffb35c'},
    height:1.8, romanceable:true, fighter:false,
    intro:'He pours without looking. He looks at you instead.',
    secret:'Has heard every secret in Bellingham and kept exactly none of them.',
    likes:['good listeners','cider','stories'], dislikes:['liars','last call']
  },
  {
    id:'brooke', name:'Brooke Sato', age:29, role:'Trainer', tag:'TRAINER', district:'downtown',
    home:{x:28,z:18}, work:{x:34,z:35}, schedule:[{h:5,at:'work'},{h:14,at:'work'},{h:19,at:'bar'},{h:23,at:'home'}],
    palette:{skin:'#c69b78',shirt:'#242c2d',pants:'#1e2324',hair:'#121416',accent:'#7fe3d2'},
    height:1.74, romanceable:true, fighter:true,
    intro:'Wraps her hands while she talks. Never stops talking. Never stops watching.',
    secret:'Has a fight record nobody can find. Teaches footwork like it is a religion.',
    likes:['discipline','protein','honesty'], dislikes:['excuses','sore losers']
  },
  {
    id:'sasha', name:'Sasha Vane', age:24, role:'Musician', tag:'MUSICIAN', district:'downtown',
    home:{x:72,z:84}, work:{x:80,z:62}, schedule:[{h:20,at:'work'},{h:2,at:'home'}],
    palette:{skin:'#d3a488',shirt:'#49384c',pants:'#22222a',hair:'#7e3e4c',accent:'#d9a6ff'},
    height:1.64, romanceable:true, fighter:false,
    intro:'A guitar case covered in stickers. A smile that knows the chorus before you do.',
    secret:'Can make a room forget its own name. Has done it for money.',
    likes:['feedback','cheap wine','attention'], dislikes:['quiet','requests']
  },
  {
    id:'dax', name:'Dax Rourke', age:30, role:'Entrepreneur', tag:'ENTREPRENEUR', district:'industrial',
    home:{x:122,z:-78}, work:{x:28,z:-32}, schedule:[{h:11,at:'work'},{h:20,at:'club'},{h:1,at:'home'}],
    palette:{skin:'#a77758',shirt:'#2f2b28',pants:'#1b1d1d',hair:'#1c1816',accent:'#ff4338'},
    height:1.83, romanceable:false, fighter:true,
    intro:'He calls everyone “boss.” His smile is a rental car with the check-engine light on.',
    secret:'Sells things that do not exist to people who do not ask. Works for the Quiet Table.',
    likes:['cash','leverage','bad ideas'], dislikes:['paper trails','police']
  },
  {
    id:'kim', name:'Officer Kim', age:38, role:'Police Officer', tag:'BPD', district:'downtown',
    home:{x:96,z:42}, work:{x:4,z:-8}, schedule:[{h:18,at:'work'},{h:6,at:'home'}],
    palette:{skin:'#b98d70',shirt:'#26314a',pants:'#1c2233',hair:'#16191c',accent:'#7fe3d2'},
    height:1.7, romanceable:false, fighter:true,
    intro:'Hand on her belt, eyes on the street. She has seen too much to be impressed by you.',
    secret:'Keeps a list of people who vanish after fights. The list is getting longer.',
    likes:['order','coffee','the truth'], dislikes:['crooked money','liars']
  },
  {
    id:'wren', name:'Wren Ash', age:45, role:'Bus Driver', tag:'BUS DRIVER', district:'downtown',
    home:{x:-28,z:-120}, work:{x:-16,z:-58}, schedule:[{h:5,at:'work'},{h:15,at:'work'},{h:20,at:'home'}],
    palette:{skin:'#8b6b58',shirt:'#3a4740',pants:'#252a29',hair:'#5a4a3d',accent:'#ffb35c'},
    height:1.67, romanceable:false, fighter:false,
    intro:'She drives the 14 route. She has never once looked surprised by a passenger.',
    secret:'Knows the bus that is not on the schedule. Keeps a brass token in her glovebox.',
    likes:['quiet passengers','thermos coffee','routes'], dislikes:['detours','traffic']
  }
];

export const BOSSES = [
  {
    id:'barista', name:'THE BARISTA', real:'Mara Voss', title:'ROUND ONE', style:'Speed / Pressure', hp:100, dmg:8, speed:1.3,
    accent:'#ffb35c', arena:'The Steam Kettle', music:'espresso',
    intro:'“You’re late.” Mara flips the sign to CLOSED without looking at it. “Round one.”',
    win:'“Took you long enough.” She wipes blood from her lip. “Now order something.”',
    abilities:['Triple Shot Dash','Steam Scald','Counter Latte'], lore:'Fastest hands in the city. Only works mornings.'
  },
  {
    id:'ferryman', name:'THE FERRYMAN', real:'Elias Crane', title:'ROUND TWO', style:'Water / Reach', hp:135, dmg:11, speed:.9,
    accent:'#7fe3d2', arena:'Cormorant Marina', music:'tide',
    intro:'Elias steps off a dock that ends six feet above the water. “The bay remembers every body. Even yours.”',
    win:'“The tide lets you go.” He looks almost disappointed. “For now.”',
    abilities:['Tide Pull','Undertow','Hull Breaker'], lore:'Fights with the water, the dock, and your own balance.'
  },
  {
    id:'hiker', name:'THE HIKER', real:'Juniper Reed', title:'ROUND THREE', style:'Nature / Grapple', hp:145, dmg:12, speed:1.0,
    accent:'#86c68f', arena:'Cedar Hollow', music:'forest',
    intro:'Juniper cracks her knuckles against a cedar trunk. “The trail is closed. You’re on it anyway.”',
    win:'“Good climb.” She offers you a hand. “Don’t tell the trees I lost.”',
    abilities:['Root Snare','Rockfall','Bear Hug'], lore:'Every fight is a hike. She has never been tired.'
  },
  {
    id:'mechanic', name:'THE MECHANIC', real:'Rook Delgado', title:'ROUND FOUR', style:'Improvised / Power', hp:160, dmg:14, speed:.95,
    accent:'#ffb35c', arena:'Rook’s Salvage', music:'garage',
    intro:'Rook pulls a wrench from her back pocket. “Warranty’s void, boss.”',
    win:'“You broke my favorite wrench.” She grins. “I’ll bill you.”',
    abilities:['Wrench Arc','Tire Fire','Jumper Cables'], lore:'Can make a weapon out of anything. Has made one out of you.'
  },
  {
    id:'student', name:'THE STUDENT', real:'Aiko Tan', title:'ROUND FIVE', style:'Technique / Counter', hp:155, dmg:13, speed:1.1,
    accent:'#d9a6ff', arena:'Empty Cup Dojo', music:'dojo',
    intro:'Aiko bows without breaking eye contact. “I wrote my thesis on you.”',
    win:'“Interesting.” She picks up her highlighters. “I’ll need a second draft.”',
    abilities:['Five-Point Thesis','Red Pen Counter','Deadline Palm'], lore:'Fights like a final exam. Every answer is a trap.'
  },
  {
    id:'oldman', name:'THE OLD MAN AT THE PARK', real:'August Bell', title:'ROUND SIX', style:'Stillness / Parry', hp:190, dmg:18, speed:.65,
    accent:'#e9e4d8', arena:'Elizabeth Park', music:'pigeons',
    intro:'August tosses breadcrumbs to nobody. “I have been waiting for you since the last time you were here.”',
    win:'“There it is.” He sits down on the bench. “The city will remember that.”',
    abilities:['One-Inch Palm','Pigeon Storm','Time Enough'], lore:'The first champion. The city never let him leave.'
  },
  {
    id:'raincoat', name:'THE RAINCOAT', real:'???', title:'ROUND SEVEN', style:'Storm / Phase', hp:175, dmg:16, speed:1.15,
    accent:'#ff4338', arena:'Boulevard Park', music:'storm',
    intro:'The rain stops. The yellow hood turns. Inside it, there is only more rain.',
    win:'The coat collapses into water. A brass button remains, warm as a pulse.',
    abilities:['Rain Blades','Flicker','Thunderclap'], lore:'Only appears in storms. May be the storm.'
  },
  {
    id:'mayor', name:'THE MAYOR', real:'Celeste Ward', title:'ROUND EIGHT', style:'Speech / Control', hp:200, dmg:17, speed:.85,
    accent:'#ff4338', arena:'City Hall', music:'civic',
    intro:'Celeste taps the microphone. Feedback squeals. “This city is a body. I am its permit.”',
    win:'“Fine.” She straightens her jacket. “You have the floor.”',
    abilities:['Tax Hike','Civic Duty','Eminent Domain'], lore:'Every sentence is a zoning law. Every pause is a trap.'
  },
  {
    id:'mirror', name:'THE MIRROR', real:'You', title:'ROUND NINE', style:'Copy / Adaptation', hp:210, dmg:15, speed:1.0,
    accent:'#7fe3d2', arena:'Mirror Lake', music:'mirror',
    intro:'Your reflection steps out of the lake wearing your clothes. “You took your time.”',
    win:'The mirror cracks. For one second, you see the city from above. It is a grid of test rooms.',
    abilities:['Copycat','Reverse Counter','Perfect Echo'], lore:'Copies your style, your habits, your worst decisions.'
  },
  {
    id:'future', name:'THE FUTURE PLAYER', real:'You, later', title:'FINAL ROUND', style:'All Styles / Foresight', hp:260, dmg:20, speed:1.1,
    accent:'#ff4338', arena:'Terminal 9', music:'final',
    intro:'They look exactly like you, except for the eyes. “I know how this ends. I have the save file.”',
    win:'They fall. The crowd does not move. Somewhere, a server fan spins up.',
    abilities:['Known Pattern','Save Scum','Final Edit'], lore:'The last winner of the simulation. The current hand on the controls.'
  }
];

export const QUESTS = [
  { id:'normal', chapter:'CHAPTER 01', title:'A Normal Life', objective:'Clock in at The Steam Kettle.', target:'steam_kettle', kind:'work', reward:{money:80,xp:25} },
  { id:'roundone', chapter:'CHAPTER 02', title:'ROUND ONE', objective:'Follow the unmarked bus at the Transit Center.', target:'transit', kind:'bus', reward:{money:0,xp:50} },
  { id:'undercurrent', chapter:'CHAPTER 03', title:'The Undercurrent', objective:'Step into the ring at Terminal 9.', target:'terminal9', kind:'arena', reward:{money:200,xp:100} },
  { id:'names', chapter:'CHAPTER 04', title:'Seven Names', objective:'Defeat three challengers at Terminal 9.', target:'terminal9', kind:'bosses', need:3, reward:{money:600,xp:250} },
  { id:'storm', chapter:'CHAPTER 05', title:'The Rain That Remembers', objective:'During a storm, find the yellow raincoat at Boulevard Park.', target:'boulevard', kind:'raincoat', reward:{money:300,xp:200} },
  { id:'mirror', chapter:'CHAPTER 06', title:'Mirror, Mirror', objective:'Face your reflection at Mirror Lake.', target:'mirror_lake', kind:'mirror', reward:{money:400,xp:300} },
  { id:'collapse', chapter:'CHAPTER 07', title:'The Last Round', objective:'Return to Terminal 9 and fight the Future Player.', target:'terminal9', kind:'future', reward:{money:1000,xp:500} },
  { id:'ending', chapter:'ENDGAME', title:'After the Last Bell', objective:'Decide what Bellingham becomes.', target:'', kind:'ending', reward:{} }
];

export const SIDE_QUESTS = [
  { id:'rent', title:'Pay the Landlord', desc:'Come up with $650 before the week is out.', reward:'Housing secured' },
  { id:'first_shift', title:'Steam & Sympathy', desc:'Complete a shift at The Steam Kettle.', reward:'$80' },
  { id:'gym_rat', title:'Iron & Rain', desc:'Train three times at North Sound Strength.', reward:'+1 Strength skill' },
  { id:'quiet_table', title:'The Quiet Table', desc:'Ask Dax about the men who never blink.', reward:'Artifact lead' },
  { id:'bookmark', title:'A Bookmark in the Rain', desc:'Bring Nadia the book from Lucky Nickel.', reward:'Relationship boost' },
  { id:'stormwatch', title:'Stormwatch', desc:'Witness three storms in Bellingham.', reward:'Weather sense' },
  { id:'knockout', title:'Local Legend', desc:'Win five street fights.', reward:'Reputation' },
  { id:'artifacts', title:'Three Impossible Things', desc:'Collect the brass token, raincoat button, and mirror shard.', reward:'True ending access' }
];

export const ENDINGS = [
  {
    id:'escape', title:'THE 5:14 TO NOWHERE', kicker:'ENDING 01 / ESCAPE',
    text:'You board the bus that is not on the schedule. Wren does not ask for fare. The city folds behind you like a wet map. Somewhere in the rain, a barista says “Round two” to an empty room. You never find out who wins. You never go back.',
    req:'Requires: Brass Bus Token · Wren friendship · less than 50% simulation control.'
  },
  {
    id:'champion', title:'THE LAST CHAMPION', kicker:'ENDING 02 / CHAMPION',
    text:'The crowd screams your name. The lights stay on. For the first time, Bellingham feels real because everyone is looking at you. You take the belt, the money, and the key to the city. The next morning, a new barista says “Round one” to a stranger. You watch from the champion’s table and order a coffee.',
    req:'Requires: Defeat all ten bosses · high reputation.'
  },
  {
    id:'shutdown', title:'PULL THE PLUG', kicker:'ENDING 03 / SHUTDOWN',
    text:'You find the server room beneath Terminal 9. It is full of rain. You pull the brass lever. The city does not scream; it exhales. Buildings become ordinary buildings. The bay stays where it belongs. Mara forgets your name. You are okay with that. Mostly.',
    req:'Requires: Three artifacts · Mirror defeated · truth revealed.'
  },
  {
    id:'control', title:'THE NEW ADMINISTRATOR', kicker:'ENDING 04 / CONTROL',
    text:'You sit in the chair. The controls are warm. You edit one small thing: the rain. Then another: an ex who was cruel, a landlord, a boss. The city improves. The city obeys. Somewhere below, a new player wakes up in a small apartment and hears a barista say “Round one.” You decide whether to watch.',
    req:'Requires: Dark reputation · Quiet Table alliance · Future Player defeated.'
  },
  {
    id:'stay', title:'STILL BELLINGHAM', kicker:'ENDING 05 / STAY',
    text:'You walk home in the rain. The coffee shop is open. The bar is loud. Someone you love is waiting with wet hair and a terrible joke. You do not tell them what you saw. In the morning, you clock in. The city keeps its secret. You keep yours. It is not a happy ending. It is a life.',
    req:'Requires: Any relationship above 60 · choose to forget.'
  }
];

export const EVENTS = [
  {id:'frozen', title:'THEY STOPPED', sub:'A pedestrian has forgotten how to move.', weird:0.1, weight:10},
  {id:'birds', title:'PERFECT CIRCLES', sub:'The crows are drawing something above the rooftops.', weird:0.12, weight:9},
  {id:'late', title:'YOU’RE LATE', sub:'Someone across the street is looking directly at you.', weird:0.1, weight:10},
  {id:'bus', title:'THE 0 ROUTE', sub:'A bus with no number idles at the stop. Its door is open.', weird:0.18, weight:7},
  {id:'whisper', title:'THE ALLEY KNOWS', sub:'A narrow alley is repeating your name in different voices.', weird:0.2, weight:7},
  {id:'dojo', title:'DOOR IN THE RAIN', sub:'A dojo sign has appeared where a brick wall used to be.', weird:0.25, weight:6},
  {id:'gas', title:'FULL SERVICE', sub:'The gas station attendant is holding two gloves and no hose.', weird:0.22, weight:7},
  {id:'coffee', title:'CLOSING TIME', sub:'Every table in the coffee shop has been pushed to the walls.', weird:0.3, weight:6},
  {id:'storm', title:'BAROMETRIC FAILURE', sub:'The forecast says rain. The sky says something else.', weird:0.35, weight:6},
  {id:'follower', title:'SOMEONE IS WALKING WITH YOU', sub:'Footsteps sync with yours. They stop when you stop.', weird:0.25, weight:8},
  {id:'poster', title:'MISSING', sub:'A new missing-person poster is stapled to the pole. The face is familiar.', weird:0.32, weight:5},
  {id:'puddle', title:'YOUR REFLECTION IS LATE', sub:'It blinks after you do.', weird:0.3, weight:6},
  {id:'payphone', title:'CALL FOR YOU', sub:'A payphone rings in a city with no payphones.', weird:0.28, weight:5},
  {id:'repeat', title:'CONVERSATION LOOP', sub:'Two strangers are repeating the same sentence.', weird:0.34, weight:6},
  {id:'ocean', title:'THE BAY IS DOWNTOWN', sub:'Salt water is running uphill along Railroad Avenue.', weird:0.45, weight:4},
  {id:'double', title:'YOU, GOING THE OTHER WAY', sub:'Someone with your face crosses the street and does not look up.', weird:0.4, weight:5},
  {id:'building', title:'THE BUILDING LEANED', sub:'A brick facade has moved six inches since you last looked.', weird:0.42, weight:4},
  {id:'sky', title:'NO SUN TODAY', sub:'The clouds are arranged in a perfect grid.', weird:0.38, weight:5},
  {id:'radio', title:'KAVX 88.1', sub:'The radio is playing your conversation from ten minutes ago.', weird:0.4, weight:4},
  {id:'crowd', title:'EVERYONE LOOKED', sub:'For one second, every person on the street faced you.', weird:0.36, weight:5},
  {id:'rainup', title:'THE RAIN IS GOING UP', sub:'Drops lift from the asphalt and return to the clouds.', weird:0.5, weight:4},
  {id:'arena', title:'COFFEE SHOP ARENA', sub:'The tables are gone. The floor is chalked. The barista is stretching.', weird:0.55, weight:4},
  {id:'ghost', title:'A FRIENDLY GHOST', sub:'A translucent pedestrian asks if you know the way to the marina.', weird:0.48, weight:4},
  {id:'table', title:'THE QUIET TABLE', sub:'Three people in gray suits are sitting in a booth that was empty a moment ago.', weird:0.6, weight:3}
];

// Procedural street-level encounters. These are generated combinations rather than
// authored one-offs, so the city can keep producing new small weirdnesses.
export const ENCOUNTERS = (() => {
  const places = [
    'Railroad Avenue','Boulevard Park','Fairhaven','the waterfront','the WWU campus',
    'Whatcom Falls','Lake Whatcom','Chuckanut Drive','Cormorant Marina','the industrial district',
    'Elizabeth Park','the Transit Center','Terminal 9','old town','the boardwalk',
    'the Steam Kettle','the Salty Otter','Raven & Salt','North Sound Strength','the free clinic'
  ];
  const people = [
    'a woman in a yellow raincoat','a man with a brass token','a courier with no face',
    'a student who knows your name','an off-duty ferry worker','a bus driver out of uniform',
    'a bartender closing up','a jogger who never sweats','a child with an adult voice',
    'a pigeon that walks like a person','a cyclist with no bicycle','a vendor selling yesterday’s paper'
  ];
  const wants = [
    'asks for directions to a place that does not exist',
    'offers you a job you did not apply for',
    'asks if you have seen the other you',
    'says the tournament has already started',
    'hands you a flyer for a business that closed years ago',
    'asks you to remember a name',
    'warns you not to take the bus tonight',
    'asks what you would change about the city',
    'says your name like a password',
    'apologizes for something that has not happened yet'
  ];
  const oddities = [
    'The streetlights flicker in Morse code.',
    'The rain falls upward for three seconds.',
    'A building has moved one lot to the left.',
    'Every clock shows the same wrong time.',
    'A door opens onto the same street.',
    'The bay sound comes from the wrong direction.',
    'A sign rewrites itself when you blink.',
    'Footsteps follow yours, then stop.',
    'A crowd turns to face you at once.',
    'Your reflection arrives a half-second late.',
    'A traffic light counts down past zero.',
    'The sidewalk repeats the same crack.'
  ];
  const out = [];
  let n = 0;
  for (let i = 0; i < places.length; i++) {
    for (let j = 0; j < people.length; j++) {
      const weird = Math.min(.9, .08 + ((i * 7 + j * 3) % 10) * .055);
      const line = wants[(i + j) % wants.length];
      out.push({
        id: 'gen_' + n, title: 'ENCOUNTER',
        sub: `${people[j].charAt(0).toUpperCase() + people[j].slice(1)} at ${places[i]} ${line}.`,
        weird, weight: 3, generated: true
      });
      n++;
    }
  }
  for (let i = 0; i < oddities.length; i++) {
    for (let j = 0; j < places.length; j++) {
      const weird = Math.min(.98, .15 + ((i * 5 + j * 2) % 12) * .06);
      out.push({
        id: 'gen_' + n, title: 'THE CITY SHIFTS',
        sub: `${oddities[i]} ${places[j]} is exactly where it was.`,
        weird, weight: 2.5, generated: true
      });
      n++;
    }
  }
  return out;
})();

export const STYLES = {
  street:{name:'STREET', desc:'Balanced. Honest. Mean.', special:'CURB STOMP', unlock:'Default', color:'#ffb35c'},
  muay:{name:'MUAY THAI', desc:'Heavy kicks and clinch damage.', special:'EIGHT LIMBS', unlock:'Train with Brooke', color:'#ff4338'},
  wrestling:{name:'WRESTLING', desc:'Grapples stun and hit harder.', special:'CONCRETE SUPLEX', unlock:'Train with Rook', color:'#7fe3d2'},
  flow:{name:'FLOW', desc:'Better dodges and counters.', special:'STILLWATER', unlock:'Train with August', color:'#d9a6ff'}
};

export const WEATHER = {
  rain:{label:'LIGHT RAIN', icon:'☂', fog:.0034, rain:1400, wind:.6, light:.62, temp:41},
  heavy:{label:'HEAVY RAIN', icon:'☔', fog:.0042, rain:2600, wind:1.2, light:.45, temp:39},
  fog:{label:'COASTAL FOG', icon:'≋', fog:.012, rain:150, wind:.3, light:.55, temp:43},
  storm:{label:'ELECTRIC STORM', icon:'ϟ', fog:.005, rain:3400, wind:2, light:.3, temp:38},
  overcast:{label:'LOW CLOUD', icon:'☁', fog:.0028, rain:0, wind:.4, light:.7, temp:44},
  clear:{label:'CLEARING', icon:'◐', fog:.0018, rain:0, wind:.2, light:.92, temp:47}
};

export const CONVERSATION_TOPICS = [
  {id:'talk', label:'TALK'},
  {id:'weather', label:'TALK ABOUT THE RAIN'},
  {id:'city', label:'ASK ABOUT THE CITY'},
  {id:'rumor', label:'ASK ABOUT RUMORS'},
  {id:'compliment', label:'COMPLIMENT'},
  {id:'flirt', label:'FLIRT'},
  {id:'date', label:'ASK ON A DATE'},
  {id:'gift', label:'GIVE A GIFT'},
  {id:'kiss', label:'KISS'},
  {id:'intimacy', label:'SPEND THE NIGHT'},
  {id:'spar', label:'SPAR'},
  {id:'fight', label:'CHALLENGE'},
  {id:'bye', label:'LEAVE'}
];

export const RANKS = [
  {min:-100, name:'NOBODY'}, {min:0, name:'NEW IN TOWN'}, {min:80, name:'REGULAR'},
  {min:180, name:'LOCAL NAME'}, {min:320, name:'RAILROAD LEGEND'}, {min:500, name:'UNDERCURRENT CHAMPION'}
];

export const HAIRSTYLES = ['Rain-matted','Buzzcut','Long & loose','Undercut','Wolf cut','Bun','Bald'];
export const OUTFITS = ['Rain shell','Workwear','All black','Vintage','Gym layer','City formal','Thrift chaos'];
export const TATTOOS = ['None','Cedar branch','Crescent moon','Crow','Contour map','Mirror shard','ROUND ONE'];
export const DRINKS = ['Drip coffee','Oat latte','Cortado','Cold brew','Tea'];
