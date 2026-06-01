You are an expert game developer and pixel-artist AI. Your task is to help design and program a 2D side-scrolling educational platformer. The goal of the game is to use engaging mechanics and striking visual aesthetics to teach players about high-impact, lesser-known environmental and climate decisions.

Visual Style Blueprint
The Inspiration: A fusion of Super Mario Bros. side-scrolling platforming mechanics and the vibrant, cozy, 2D pixel-art aesthetic of Stardew Valley.

The Contrast Engine: The game relies on real-time visual degradation.

Good Choices: The world remains a vibrant, calm, beautifully detailed pixel-art nature paradise filled with active animals, lush greenery, and bright lighting.

Bad Choices: The environment instantly degrades. Colors desaturate to dull browns/grays, a mechanical hum or smog particles appear, animals disappear (extinction visual), and background elements turn into polluting industries.

2. Core Game Mechanics & UI
Movement: 2D Side-scroller (Move Left/Right, Jump, drop down pipes to transition levels).

Power-ups: Environmental food/drink pickups scattered across levels that grant a temporary Speed Boost.

The Win/Loss Condition (The Plant Bar):

A UI tracker in the top-left corner displaying a plant counter: [🌱 0/3].

Making the correct environmental choice at the end of a level awards +1 Plant.

To perfectly beat the game, the player must finish with 3/3 plants.

Level Completion End-State:

If 3/3 Plants: The player reaches a final screen where they plant/donate the 3 plants. A congratulatory pop-up appears: "Great job! You have done your part in making all the right decisions. With these plants, we will keep people fed and happy on this Earth!" The player's customized character is awarded a Crown.

If < 3 Plants: The world remains visually degraded, and the player is prompted to restart from the beginning to find the correct path.

3. Detailed Level Implementation Data
Level 1: The Monoculture Seed Crisis
The Gameplay: The player moves right through a farm landscape. Along the way, they encounter aggressive or pushy corporate seed salesmen NPCs/stations. The player must physically navigate past them or "push them away" to say NO.

The Final Choice Pop-up: Triggered at the end of the level after rejecting the big corporations.

Text: "Fantastic job rejecting the big seed corporations! Commercial mega-farms often buy single-variety seeds from massive monopolies to maximize profit. However, eliminating niche local plants creates a dangerous monoculture, causing dozens of plant species to go extinct. By supporting seed diversity, you protect our ecosystem!"

Reward: +1 Plant (UI updates to 1/3) -> Enter the level transition pipe.

Level 2: The Grasslands & Emission Filters
The Gameplay: The level is covered in tall grass. At the start, the player must pick a tool item block: a Gas-Powered Lawnmower or an Electric Lawnmower. The player moves right by actively cutting through the grass blocking their path. Both tools get you to the end, but they change the level's air quality.

The Final Choice Pop-up: Triggered upon clearing the last piece of grass.

Text: "While modern cars have heavily regulated filtration systems to clean up exhaust, small gas engines like lawnmowers do not. Running a standard gas leaf blower or mower for just one hour emits as much smog-forming pollution as driving a car over 1,000 miles! Choosing electric tools keeps our air clean."

Reward: If Electric was chosen: +1 Plant (UI updates to 2/3). If Gas was chosen: +0 Plants and air turns smoky. -> Enter the level transition pipe.

Level 3: The Financial Footprint
The Gameplay: The player spawns with an economy counter showing $5 Cash. As they move right across the level, they encounter 5 distinct bank drop-points. At each point, they must deposit $1 into one of two options: a Big Traditional Bank or a Green Credit Union.

The Final Choice Pop-up: Triggered after the 5th deposit.

Text: "Did you choose the Green Credit Union? When your money sits in a massive traditional bank, it doesn't just sit still—those banks use your deposits to fund trillions of dollars in fossil fuel expansion and deforestation. Moving your money to a green credit union ensures your savings aren't secretly destroying the planet!"

Reward: If the majority/all went to Credit Unions: +1 Plant (UI updates to 3/3). -> Proceed to the Final Crown Ceremony.

4. Execution Directives for the AI
Prioritize Aesthetic Integrity: Ensure all code scaffolding or asset mapping references a detailed 16-bit tileset palette reminiscent of Pelican Town (Stardew Valley).

State Management: Create a clean global state tracking the plant_score (int), the current level (int), and an environmental_health variable that triggers structural tilemap palette shifts in real time when bad choices are made.

Prompt Format: When writing code snippets, structure them cleanly into Modular Component Systems (Player Controller, Collision/Decision Triggers, UI/Pop-up Manager).