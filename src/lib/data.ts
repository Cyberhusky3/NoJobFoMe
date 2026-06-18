export type StyleId = 'boxing'|'muay-thai'|'kickboxing'|'bjj'|'wrestling'|'judo'|'karate'|'taekwondo'|'mma';
export const styles = [
 {id:'boxing',name:'Boxing',tags:['cardio','home','striking','confidence'],curve:'Fast early wins',fitness:'Elite cardio, shoulders, core',defense:86,beginner:94,why:['Strong cardio goals','Limited equipment','High confidence-building potential']},
 {id:'muay-thai',name:'Muay Thai',tags:['striking','conditioning','self-defense'],curve:'Moderate',fitness:'Full-body power and conditioning',defense:92,beginner:82,why:['Practical striking range','Great calorie burn','Simple fundamentals scale well']},
 {id:'kickboxing',name:'Kickboxing',tags:['striking','weight-loss','home'],curve:'Fast',fitness:'Cardio, hips, legs, coordination',defense:84,beginner:88,why:['Fun high-output sessions','Works well at home','Balanced punches and kicks']},
 {id:'bjj',name:'Brazilian Jiu-Jitsu',tags:['grappling','self-defense','gym'],curve:'Slow but deep',fitness:'Core, mobility, grip strength',defense:90,beginner:78,why:['Best for ground safety','Technique beats size','Great if you like puzzles']},
 {id:'wrestling',name:'Wrestling',tags:['grappling','competition','strength'],curve:'Challenging',fitness:'Explosive strength and endurance',defense:88,beginner:70,why:['Builds toughness fast','Excellent takedowns','Competition-ready mindset']},
 {id:'judo',name:'Judo',tags:['grappling','gym','self-defense'],curve:'Moderate',fitness:'Balance, hips, pulling power',defense:86,beginner:76,why:['Learn safe falling','Powerful throws','Traditional progression']},
 {id:'karate',name:'Karate',tags:['striking','discipline','home'],curve:'Moderate',fitness:'Mobility, balance, precision',defense:76,beginner:84,why:['Structured beginner path','Low gear needs','Builds discipline']},
 {id:'taekwondo',name:'Taekwondo',tags:['striking','flexibility','competition'],curve:'Moderate',fitness:'Leg strength, flexibility, speed',defense:72,beginner:86,why:['Clear belt goals','Athletic kicks','Great for mobility']},
 {id:'mma',name:'MMA',tags:['striking','grappling','competition','gym'],curve:'Steep',fitness:'Complete athletic development',defense:95,beginner:68,why:['Most complete rule set','Mix striking and grappling','Ideal long-term path']}
] as const;
export const questions = [
 ['age','Age range',['Under 18','18-29','30-44','45+']],['fitness','Fitness level',['New','Casual','Active','Athlete']],['weightLoss','Weight loss goal',['Low','Medium','High']],['muscleGain','Muscle gain goal',['Low','Medium','High']],['selfDefense','Self-defense interest',['Low','Medium','High']],['competition','Competition interest',['No','Maybe','Yes']],['equipment','Available equipment',['None','Jump rope','Bag','Weights']],['gym','Gym access',['No','Maybe','Yes']],['home','Home workout preference',['Low','Medium','High']],['days','Training days per week',['2','3','4','5+']],['preference','Striking vs Grappling',['Striking','Grappling','Both']],['confidence','Confidence level',['Low','Medium','High']],['injury','Injury limitations',['None','Knee/ankle','Shoulder/wrist','Back/neck']]
] as const;
export const skillTrees: Record<string,string[]> = { Boxing:['Stance','Footwork','Jab','Cross','Hook','Defense','Combinations'], 'Brazilian Jiu-Jitsu':['Breakfall','Shrimp','Guard','Sweep','Armbar','Triangle'], 'Muay Thai':['Stance','Teep','Round Kick','Knees','Clinching','Elbows','Counters'], MMA:['Fight Stance','Boxing Entry','Sprawl','Wall Work','Ground Escape','Transitions','Sparring IQ'] };
export const achievements = ['First Workout','7-Day Streak','100 Jabs Practiced','First Shadowboxing Session','Mobility Master','Roadmap Week Complete','Guard Explorer','Cardio Beast'];
export const gear = ['12-16oz beginner gloves','180-inch hand wraps','Adjustable jump rope','Boil-and-bite mouthguard','Compression rash guard','Foam roller recovery kit'];
export const workouts = [
 {day:'Monday',items:['Boxing fundamentals','Core training'],blocks:['5-min rope warmup','Stance + jab mechanics','Plank and dead bug circuit','3 x 2-min shadowboxing','Breathing reset']},
 {day:'Wednesday',items:['Conditioning','Shadowboxing'],blocks:['Dynamic hips and shoulders','Footwork ladder','Bodyweight strength','Intervals: 20s on / 40s off','Calf and hip recovery']},
 {day:'Friday',items:['Technique drills'],blocks:['Joint prep','Jab-cross-hook reps','Squat and push-up ladder','Defense reaction rounds','Journal one coaching cue']},
 {day:'Saturday',items:['Mobility and recovery'],blocks:['Zone-2 walk','Breakfalls or balance drills','Posterior-chain strength','Easy shadowboxing flow','Long stretch']}
];
export const progress = {xp:1280,level:6,streak:12,weeklyGoal:4,completedThisWeek:3,unlocked:['Stance','Footwork','Jab','Cross'],badges:['First Workout','7-Day Streak','100 Jabs Practiced']};
