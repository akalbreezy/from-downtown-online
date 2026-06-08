// ============================================================
//  GAME DATA — lives on the server (source of truth)
//  APPROXIMATE values — verify against official records
//  before any public/competitive launch.
// ============================================================

const NBA_LINKS = {
  "LeBron James": ["Dwyane Wade","Chris Bosh","Kyrie Irving","Anthony Davis","Ray Allen","Russell Westbrook","Carmelo Anthony"],
  "Dwyane Wade": ["LeBron James","Chris Bosh","Ray Allen","Jimmy Butler","Goran Dragić"],
  "Chris Bosh": ["LeBron James","Dwyane Wade","Ray Allen"],
  "Kyrie Irving": ["LeBron James","Kevin Durant","James Harden","Luka Dončić","Jayson Tatum"],
  "Anthony Davis": ["LeBron James","Rajon Rondo","DeMarcus Cousins","Luka Dončić"],
  "Ray Allen": ["LeBron James","Dwyane Wade","Chris Bosh","Kevin Garnett","Paul Pierce","Rajon Rondo"],
  "Kevin Garnett": ["Ray Allen","Paul Pierce","Rajon Rondo"],
  "Paul Pierce": ["Ray Allen","Kevin Garnett","Rajon Rondo"],
  "Rajon Rondo": ["Anthony Davis","Ray Allen","Kevin Garnett","Paul Pierce","Russell Westbrook"],
  "Carmelo Anthony": ["LeBron James","Russell Westbrook","Chris Paul","James Harden","Damian Lillard"],
  "Russell Westbrook": ["LeBron James","Rajon Rondo","Carmelo Anthony","Kevin Durant","James Harden","Paul George","Chris Paul"],
  "Kevin Durant": ["Kyrie Irving","Russell Westbrook","James Harden","Stephen Curry","Draymond Green","Klay Thompson","Devin Booker"],
  "James Harden": ["Kyrie Irving","Carmelo Anthony","Russell Westbrook","Kevin Durant","Chris Paul","Joel Embiid","Kawhi Leonard","Paul George"],
  "Stephen Curry": ["Kevin Durant","Draymond Green","Klay Thompson","Chris Paul"],
  "Draymond Green": ["Kevin Durant","Stephen Curry","Klay Thompson"],
  "Klay Thompson": ["Kevin Durant","Stephen Curry","Draymond Green","Luka Dončić"],
  "Chris Paul": ["Carmelo Anthony","Russell Westbrook","James Harden","Stephen Curry","Blake Griffin","Devin Booker"],
  "Blake Griffin": ["Chris Paul","DeAndre Jordan"],
  "DeAndre Jordan": ["Blake Griffin","Luka Dončić","Kyrie Irving"],
  "Paul George": ["Russell Westbrook","James Harden","Kawhi Leonard","Joel Embiid"],
  "Kawhi Leonard": ["James Harden","Paul George","Tim Duncan","Tony Parker","Manu Ginóbili"],
  "Tim Duncan": ["Kawhi Leonard","Tony Parker","Manu Ginóbili"],
  "Tony Parker": ["Kawhi Leonard","Tim Duncan","Manu Ginóbili"],
  "Manu Ginóbili": ["Kawhi Leonard","Tim Duncan","Tony Parker"],
  "Joel Embiid": ["James Harden","Paul George","Jimmy Butler","Ben Simmons","Tyrese Maxey"],
  "Jimmy Butler": ["Dwyane Wade","Joel Embiid","Ben Simmons","Bam Adebayo"],
  "Ben Simmons": ["Joel Embiid","Jimmy Butler","Kyrie Irving","Tyrese Maxey"],
  "Bam Adebayo": ["Jimmy Butler","Goran Dragić"],
  "Goran Dragić": ["Dwyane Wade","Bam Adebayo","Luka Dončić"],
  "Luka Dončić": ["Kyrie Irving","Anthony Davis","Klay Thompson","DeAndre Jordan","Goran Dragić"],
  "Jayson Tatum": ["Kyrie Irving","Jaylen Brown","Jrue Holiday"],
  "Jaylen Brown": ["Jayson Tatum","Jrue Holiday"],
  "Jrue Holiday": ["Jayson Tatum","Jaylen Brown","Giannis Antetokounmpo","Damian Lillard"],
  "Giannis Antetokounmpo": ["Jrue Holiday","Damian Lillard","Khris Middleton"],
  "Damian Lillard": ["Carmelo Anthony","Giannis Antetokounmpo","Jrue Holiday","Khris Middleton","CJ McCollum"],
  "Khris Middleton": ["Giannis Antetokounmpo","Damian Lillard"],
  "CJ McCollum": ["Damian Lillard"],
  "Devin Booker": ["Kevin Durant","Chris Paul","Deandre Ayton"],
  "Deandre Ayton": ["Chris Paul","Devin Booker"],
  "DeMarcus Cousins": ["Anthony Davis"],
  "Tyrese Maxey": ["Joel Embiid","Ben Simmons","James Harden"],
};
const NBA_TEAMS_RAW = {
  "LeBron James|Dwyane Wade":"Heat","Chris Bosh|LeBron James":"Heat","Chris Bosh|Dwyane Wade":"Heat","Ray Allen|LeBron James":"Heat","Dwyane Wade|Ray Allen":"Heat","Chris Bosh|Ray Allen":"Heat",
  "Kyrie Irving|LeBron James":"Cavaliers","Anthony Davis|LeBron James":"Lakers","LeBron James|Rajon Rondo":"Lakers","Anthony Davis|Rajon Rondo":"Lakers","Carmelo Anthony|LeBron James":"Lakers","LeBron James|Russell Westbrook":"Lakers",
  "Kevin Garnett|Ray Allen":"Celtics","Paul Pierce|Ray Allen":"Celtics","Kevin Garnett|Paul Pierce":"Celtics","Kevin Garnett|Rajon Rondo":"Celtics","Paul Pierce|Rajon Rondo":"Celtics","Rajon Rondo|Ray Allen":"Celtics",
  "Carmelo Anthony|Russell Westbrook":"Thunder","Carmelo Anthony|Chris Paul":"Rockets","Carmelo Anthony|James Harden":"Rockets","Carmelo Anthony|Damian Lillard":"Trail Blazers",
  "Kevin Durant|Russell Westbrook":"Thunder","James Harden|Russell Westbrook":"Thunder","Paul George|Russell Westbrook":"Thunder","James Harden|Kevin Durant":"Nets","Rajon Rondo|Russell Westbrook":"Lakers","Chris Paul|Russell Westbrook":"Rockets",
  "Kevin Durant|Kyrie Irving":"Nets","James Harden|Kyrie Irving":"Nets",
  "Kevin Durant|Stephen Curry":"Warriors","Draymond Green|Kevin Durant":"Warriors","Kevin Durant|Klay Thompson":"Warriors","Draymond Green|Stephen Curry":"Warriors","Klay Thompson|Stephen Curry":"Warriors","Draymond Green|Klay Thompson":"Warriors","Chris Paul|Stephen Curry":"Warriors",
  "Devin Booker|Kevin Durant":"Suns",
  "Chris Paul|James Harden":"Rockets","James Harden|Joel Embiid":"76ers","James Harden|Paul George":"Clippers","James Harden|Kawhi Leonard":"Clippers","Kawhi Leonard|Paul George":"Clippers","Joel Embiid|Paul George":"76ers","Blake Griffin|Chris Paul":"Clippers","Blake Griffin|DeAndre Jordan":"Clippers","DeAndre Jordan|Luka Dončić":"Mavericks","DeAndre Jordan|Kyrie Irving":"Nets",
  "Kawhi Leonard|Tim Duncan":"Spurs","Kawhi Leonard|Tony Parker":"Spurs","Kawhi Leonard|Manu Ginóbili":"Spurs","Tim Duncan|Tony Parker":"Spurs","Manu Ginóbili|Tim Duncan":"Spurs","Manu Ginóbili|Tony Parker":"Spurs",
  "Jimmy Butler|Joel Embiid":"76ers","Ben Simmons|Joel Embiid":"76ers","Joel Embiid|Tyrese Maxey":"76ers","Ben Simmons|Jimmy Butler":"76ers","James Harden|Tyrese Maxey":"76ers","Ben Simmons|Kyrie Irving":"Nets","Ben Simmons|Tyrese Maxey":"76ers",
  "Dwyane Wade|Jimmy Butler":"Bulls","Bam Adebayo|Jimmy Butler":"Heat","Bam Adebayo|Goran Dragić":"Heat","Dwyane Wade|Goran Dragić":"Heat","Goran Dragić|Luka Dončić":"Mavericks","Klay Thompson|Luka Dončić":"Mavericks","Anthony Davis|Luka Dončić":"Lakers","Kyrie Irving|Luka Dončić":"Mavericks",
  "Jaylen Brown|Jayson Tatum":"Celtics","Jayson Tatum|Jrue Holiday":"Celtics","Jaylen Brown|Jrue Holiday":"Celtics","Jayson Tatum|Kyrie Irving":"Celtics",
  "Giannis Antetokounmpo|Jrue Holiday":"Bucks","Damian Lillard|Giannis Antetokounmpo":"Bucks","Giannis Antetokounmpo|Khris Middleton":"Bucks","Damian Lillard|Khris Middleton":"Bucks","Damian Lillard|Jrue Holiday":"Trail Blazers","CJ McCollum|Damian Lillard":"Trail Blazers",
  "Chris Paul|Devin Booker":"Suns","Chris Paul|Deandre Ayton":"Suns","Deandre Ayton|Devin Booker":"Suns","Anthony Davis|DeMarcus Cousins":"Pelicans",
};

const NBL_LINKS = {
  "Bryce Cotton": ["Damian Martin","Jesse Wagstaff","Greg Hire","Mitch Norton"],
  "Damian Martin": ["Bryce Cotton","Jesse Wagstaff","Greg Hire"],
  "Jesse Wagstaff": ["Bryce Cotton","Damian Martin","Greg Hire","Mitch Norton"],
  "Greg Hire": ["Bryce Cotton","Damian Martin","Jesse Wagstaff"],
  "Mitch Norton": ["Bryce Cotton","Jesse Wagstaff"],
  "Chris Goulding": ["Matthew Dellavedova","Jock Landale","Mitch McCarron"],
  "Matthew Dellavedova": ["Chris Goulding","Jock Landale","Mitch McCarron"],
  "Jock Landale": ["Chris Goulding","Matthew Dellavedova","Mitch McCarron"],
  "Mitch McCarron": ["Chris Goulding","Matthew Dellavedova","Jock Landale"],
  "Andrew Bogut": ["Kevin Lisch","Brad Newley","Jae'Sean Tate"],
  "Kevin Lisch": ["Andrew Bogut","Brad Newley","Jae'Sean Tate"],
  "Brad Newley": ["Andrew Bogut","Kevin Lisch","Jae'Sean Tate"],
  "Jae'Sean Tate": ["Andrew Bogut","Kevin Lisch","Brad Newley"],
};
const NBL_TEAMS_RAW = {
  "Bryce Cotton|Damian Martin":"Perth","Bryce Cotton|Jesse Wagstaff":"Perth","Bryce Cotton|Greg Hire":"Perth","Bryce Cotton|Mitch Norton":"Perth","Damian Martin|Jesse Wagstaff":"Perth","Damian Martin|Greg Hire":"Perth","Greg Hire|Jesse Wagstaff":"Perth","Jesse Wagstaff|Mitch Norton":"Perth",
  "Chris Goulding|Matthew Dellavedova":"Melbourne Utd","Chris Goulding|Jock Landale":"Melbourne Utd","Chris Goulding|Mitch McCarron":"Melbourne Utd","Jock Landale|Matthew Dellavedova":"Melbourne Utd","Matthew Dellavedova|Mitch McCarron":"Melbourne Utd","Jock Landale|Mitch McCarron":"Melbourne Utd",
  "Andrew Bogut|Kevin Lisch":"Sydney","Andrew Bogut|Brad Newley":"Sydney","Andrew Bogut|Jae'Sean Tate":"Sydney","Brad Newley|Kevin Lisch":"Sydney","Jae'Sean Tate|Kevin Lisch":"Sydney","Brad Newley|Jae'Sean Tate":"Sydney",
};

const NBA_TRIVIA=[
  {q:"Who holds the NBA all-time regular-season scoring record?",a:["Kareem Abdul-Jabbar","LeBron James","Karl Malone","Kobe Bryant"],correct:1},
  {q:"Which team won the most titles in the 1990s?",a:["Bulls","Lakers","Rockets","Spurs"],correct:0},
  {q:"Who has the most career assists in NBA history?",a:["John Stockton","Magic Johnson","Chris Paul","Jason Kidd"],correct:0},
  {q:"Which player won 4 MVPs in the 2010s?",a:["LeBron James","Kevin Durant","Stephen Curry","Giannis"],correct:0},
  {q:"What number did Allen Iverson famously wear?",a:["1","3","6","24"],correct:1},
  {q:"Which city's team is the Splash Brothers' home?",a:["Oakland/SF","Houston","Phoenix","Denver"],correct:0},
  {q:"Who was drafted #1 overall in 2003?",a:["Carmelo Anthony","LeBron James","Dwyane Wade","Chris Bosh"],correct:1},
  {q:"Most three-pointers in a single season (record holder)?",a:["Stephen Curry","Klay Thompson","James Harden","Ray Allen"],correct:0},
  {q:"Which team drafted Kobe Bryant before trading him?",a:["Hornets","Lakers","Clippers","Hawks"],correct:0},
  {q:"Who won Finals MVP in 2016?",a:["LeBron James","Kyrie Irving","Stephen Curry","Kevin Love"],correct:0},
];
const NBA_STAT=[
  {player:"Wilt Chamberlain",stat:"points in his record single game",value:100},
  {player:"Kobe Bryant",stat:"points in his 2nd-highest single game",value:81},
  {player:"LeBron James",stat:"career All-Star selections (approx)",value:20},
  {player:"Stephen Curry",stat:"threes made in record season (approx)",value:402},
  {player:"Russell Westbrook",stat:"triple-doubles in 2016-17 season",value:42},
  {player:"Michael Jordan",stat:"career scoring titles",value:10},
  {player:"Magic Johnson",stat:"career assists per game (approx)",value:11},
  {player:"Hakeem Olajuwon",stat:"career blocks (approx)",value:3830},
];
const NBA_DARTS=[
  {id:"pts",label:"Career Points (thousands)",unit:"pts",db:[
    {name:"LeBron James",value:40},{name:"Kareem Abdul-Jabbar",value:38},{name:"Karl Malone",value:36},
    {name:"Kobe Bryant",value:33},{name:"Michael Jordan",value:32},{name:"Dirk Nowitzki",value:31},
    {name:"Wilt Chamberlain",value:31},{name:"Shaquille O'Neal",value:28},
  ]},
  {id:"3pm",label:"Career 3-Pointers Made",unit:"threes",db:[
    {name:"Stephen Curry",value:3800},{name:"Ray Allen",value:2973},{name:"James Harden",value:2900},
    {name:"Reggie Miller",value:2560},{name:"Kyle Korver",value:2450},{name:"Klay Thompson",value:2400},
    {name:"Damian Lillard",value:2300},{name:"Vince Carter",value:2290},
  ]},
];
const NBL_TRIVIA=[
  {q:"Which club has won the most NBL championships?",a:["Melbourne United","Perth Wildcats","Sydney Kings","Brisbane Bullets"],correct:1},
  {q:"Andrew Gaze played his club career mostly with?",a:["Sydney Kings","Melbourne Tigers","Adelaide 36ers","Cairns Taipans"],correct:1},
  {q:"LaMelo Ball played an NBL season with which club?",a:["Illawarra Hawks","Sydney Kings","NZ Breakers","SE Melbourne Phoenix"],correct:0},
  {q:"The NZ Breakers are based in which city?",a:["Wellington","Christchurch","Auckland","Hamilton"],correct:2},
  {q:"Bryce Cotton has won multiple MVPs with which club?",a:["Perth Wildcats","Melbourne United","Sydney Kings","Tasmania"],correct:0},
  {q:"Which 2021 expansion team won a title in 2024?",a:["JackJumpers","Bullets","Phoenix","Taipans"],correct:0},
  {q:"How many teams contest the modern NBL (approx)?",a:["6","8","10","14"],correct:2},
  {q:"Andrew Bogut won an NBL MVP with which club?",a:["Sydney Kings","Perth","Melbourne","Brisbane"],correct:0},
];
const NBL_STAT=[
  {player:"Andrew Gaze",stat:"NBL MVP awards (approx)",value:7},
  {player:"Bryce Cotton",stat:"NBL MVP awards (approx)",value:4},
  {player:"Perth Wildcats",stat:"NBL championships (approx)",value:10},
  {player:"NZ Breakers",stat:"NBL championships (approx)",value:4},
  {player:"Sydney Kings",stat:"NBL championships (approx)",value:6},
  {player:"Tasmania JackJumpers",stat:"year of first title",value:2024},
];
const NBL_DARTS=[
  {id:"titles",label:"Club NBL Championships",unit:"titles",db:[
    {name:"Perth Wildcats",value:10},{name:"Sydney Kings",value:6},{name:"Melbourne United",value:5},
    {name:"NZ Breakers",value:4},{name:"Adelaide 36ers",value:4},{name:"Brisbane Bullets",value:3},
    {name:"Illawarra Hawks",value:1},{name:"Tasmania JackJumpers",value:1},
  ]},
  {id:"mvp",label:"Player MVP Awards",unit:"MVPs",db:[
    {name:"Andrew Gaze",value:7},{name:"Bryce Cotton",value:4},{name:"Leroy Loggins",value:3},
    {name:"James Crawford",value:2},{name:"Kevin Lisch",value:2},{name:"Andrew Bogut",value:1},
  ]},
];

function pairKey(a,b){ return [a,b].sort().join("|"); }
function buildChain(links){
  const g={}; const add=(a,b)=>{(g[a]=g[a]||new Set()).add(b);};
  Object.entries(links).forEach(([p,ms])=>ms.forEach(m=>{add(p,m);add(m,p);}));
  return g;
}
function buildTeams(raw){ const m={}; Object.entries(raw).forEach(([k,t])=>{const[a,b]=k.split("|");m[pairKey(a,b)]=t;}); return m; }
function median(ns){ const s=[...ns].sort((a,b)=>a-b); const m=Math.floor(s.length/2); return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2); }

const LEAGUES = {
  nba: { name:"NBA", chain:buildChain(NBA_LINKS), teams:buildTeams(NBA_TEAMS_RAW), trivia:NBA_TRIVIA, stat:NBA_STAT, darts:NBA_DARTS },
  nbl: { name:"NBL", chain:buildChain(NBL_LINKS), teams:buildTeams(NBL_TEAMS_RAW), trivia:NBL_TRIVIA, stat:NBL_STAT, darts:NBL_DARTS },
};

module.exports = { LEAGUES, pairKey, median };
