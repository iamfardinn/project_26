import json
import os
import random

# List of 48 teams grouped by continent/region to generate realistic names
TEAMS_LIST = [
    'Mexico', 'South Africa', 'South Korea', 'Czechia',
    'Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland',
    'Brazil', 'Morocco', 'Scotland', 'Haiti',
    'USA', 'Australia', 'Paraguay', 'Turkey',
    'Germany', 'Ecuador', 'Ivory Coast', 'Curacao',
    'Netherlands', 'Japan', 'Tunisia', 'Sweden',
    'Belgium', 'Iran', 'Egypt', 'New Zealand',
    'Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde',
    'France', 'Norway', 'Senegal', 'Iraq',
    'Argentina', 'Austria', 'Algeria', 'Jordan',
    'Portugal', 'Colombia', 'Uzbekistan', 'DR Congo',
    'England', 'Croatia', 'Ghana', 'Panama'
]

# Real players mapping for top teams
REAL_SQUADS = {
    'France': [
        {'name': 'Kylian Mbappé', 'position': 'FW', 'club': 'Real Madrid', 'goals': 42, 'assists': 15, 'rating': 94, 'form': 9.2},
        {'name': 'Antoine Griezmann', 'position': 'MF', 'club': 'Atletico Madrid', 'goals': 12, 'assists': 14, 'rating': 87, 'form': 8.1},
        {'name': 'Ousmane Dembélé', 'position': 'FW', 'club': 'PSG', 'goals': 10, 'assists': 18, 'rating': 86, 'form': 7.9},
        {'name': 'Aurélien Tchouaméni', 'position': 'MF', 'club': 'Real Madrid', 'goals': 4, 'assists': 6, 'rating': 85, 'form': 8.0},
        {'name': 'William Saliba', 'position': 'DF', 'club': 'Arsenal', 'goals': 2, 'assists': 1, 'rating': 89, 'form': 8.8},
        {'name': 'Mike Maignan', 'position': 'GK', 'club': 'AC Milan', 'goals': 0, 'assists': 0, 'rating': 87, 'form': 8.3}
    ],
    'Argentina': [
        {'name': 'Lionel Messi', 'position': 'FW', 'club': 'Inter Miami', 'goals': 32, 'assists': 25, 'rating': 93, 'form': 9.5},
        {'name': 'Lautaro Martínez', 'position': 'FW', 'club': 'Inter Milan', 'goals': 28, 'assists': 8, 'rating': 89, 'form': 8.7},
        {'name': 'Rodrigo De Paul', 'position': 'MF', 'club': 'Atletico Madrid', 'goals': 5, 'assists': 9, 'rating': 84, 'form': 8.0},
        {'name': 'Alexis Mac Allister', 'position': 'MF', 'club': 'Liverpool', 'goals': 8, 'assists': 10, 'rating': 86, 'form': 8.4},
        {'name': 'Enzo Fernández', 'position': 'MF', 'club': 'Chelsea', 'goals': 6, 'assists': 8, 'rating': 83, 'form': 7.6},
        {'name': 'Emiliano Martínez', 'position': 'GK', 'club': 'Aston Villa', 'goals': 0, 'assists': 0, 'rating': 87, 'form': 8.6}
    ],
    'Brazil': [
        {'name': 'Vinicius Jr', 'position': 'FW', 'club': 'Real Madrid', 'goals': 35, 'assists': 18, 'rating': 92, 'form': 9.1},
        {'name': 'Rodrygo', 'position': 'FW', 'club': 'Real Madrid', 'goals': 18, 'assists': 12, 'rating': 87, 'form': 8.2},
        {'name': 'Raphinha', 'position': 'FW', 'club': 'Barcelona', 'goals': 16, 'assists': 14, 'rating': 85, 'form': 8.5},
        {'name': 'Bruno Guimarães', 'position': 'MF', 'club': 'Newcastle', 'goals': 7, 'assists': 11, 'rating': 86, 'form': 8.3},
        {'name': 'Marquinhos', 'position': 'DF', 'club': 'PSG', 'goals': 3, 'assists': 2, 'rating': 87, 'form': 8.0},
        {'name': 'Alisson Becker', 'position': 'GK', 'club': 'Liverpool', 'goals': 0, 'assists': 0, 'rating': 89, 'form': 8.4}
    ],
    'England': [
        {'name': 'Harry Kane', 'position': 'FW', 'club': 'Bayern Munich', 'goals': 45, 'assists': 12, 'rating': 91, 'form': 9.0},
        {'name': 'Jude Bellingham', 'position': 'MF', 'club': 'Real Madrid', 'goals': 24, 'assists': 16, 'rating': 92, 'form': 8.9},
        {'name': 'Bukayo Saka', 'position': 'FW', 'club': 'Arsenal', 'goals': 20, 'assists': 15, 'rating': 89, 'form': 8.7},
        {'name': 'Declan Rice', 'position': 'MF', 'club': 'Arsenal', 'goals': 6, 'assists': 8, 'rating': 87, 'form': 8.5},
        {'name': 'John Stones', 'position': 'DF', 'club': 'Man City', 'goals': 3, 'assists': 2, 'rating': 86, 'form': 8.1},
        {'name': 'Jordan Pickford', 'position': 'GK', 'club': 'Everton', 'goals': 0, 'assists': 0, 'rating': 83, 'form': 7.8}
    ],
    'Portugal': [
        {'name': 'Cristiano Ronaldo', 'position': 'FW', 'club': 'Al Nassr', 'goals': 38, 'assists': 11, 'rating': 88, 'form': 8.7},
        {'name': 'Bruno Fernandes', 'position': 'MF', 'club': 'Man United', 'goals': 18, 'assists': 19, 'rating': 89, 'form': 8.6},
        {'name': 'Bernardo Silva', 'position': 'MF', 'club': 'Man City', 'goals': 11, 'assists': 15, 'rating': 88, 'form': 8.4},
        {'name': 'Rafael Leão', 'position': 'FW', 'club': 'AC Milan', 'goals': 15, 'assists': 12, 'rating': 87, 'form': 8.0},
        {'name': 'Rúben Dias', 'position': 'DF', 'club': 'Man City', 'goals': 2, 'assists': 1, 'rating': 89, 'form': 8.5},
        {'name': 'Diogo Costa', 'position': 'GK', 'club': 'FC Porto', 'goals': 0, 'assists': 0, 'rating': 85, 'form': 8.1}
    ],
    'Spain': [
        {'name': 'Lamine Yamal', 'position': 'FW', 'club': 'Barcelona', 'goals': 15, 'assists': 18, 'rating': 87, 'form': 8.9},
        {'name': 'Nico Williams', 'position': 'FW', 'club': 'Athletic Bilbao', 'goals': 14, 'assists': 14, 'rating': 85, 'form': 8.3},
        {'name': 'Rodri', 'position': 'MF', 'club': 'Man City', 'goals': 9, 'assists': 11, 'rating': 91, 'form': 9.2},
        {'name': 'Pedri', 'position': 'MF', 'club': 'Barcelona', 'goals': 7, 'assists': 12, 'rating': 86, 'form': 8.5},
        {'name': 'Dani Carvajal', 'position': 'DF', 'club': 'Real Madrid', 'goals': 3, 'assists': 5, 'rating': 85, 'form': 8.0},
        {'name': 'Unai Simón', 'position': 'GK', 'club': 'Athletic Bilbao', 'goals': 0, 'assists': 0, 'rating': 86, 'form': 8.2}
    ],
    'Germany': [
        {'name': 'Florian Wirtz', 'position': 'MF', 'club': 'Bayer Leverkusen', 'goals': 18, 'assists': 22, 'rating': 89, 'form': 9.0},
        {'name': 'Jamal Musiala', 'position': 'MF', 'club': 'Bayern Munich', 'goals': 16, 'assists': 15, 'rating': 88, 'form': 8.7},
        {'name': 'Kai Havertz', 'position': 'FW', 'club': 'Arsenal', 'goals': 19, 'assists': 9, 'rating': 84, 'form': 8.2},
        {'name': 'Joshua Kimmich', 'position': 'MF', 'club': 'Bayern Munich', 'goals': 5, 'assists': 12, 'rating': 86, 'form': 8.1},
        {'name': 'Antonio Rüdiger', 'position': 'DF', 'club': 'Real Madrid', 'goals': 3, 'assists': 1, 'rating': 87, 'form': 8.4},
        {'name': 'Marc-André ter Stegen', 'position': 'GK', 'club': 'Barcelona', 'goals': 0, 'assists': 0, 'rating': 88, 'form': 8.3}
    ],
    'Netherlands': [
        {'name': 'Memphis Depay', 'position': 'FW', 'club': 'Corinthians', 'goals': 14, 'assists': 8, 'rating': 82, 'form': 7.6},
        {'name': 'Cody Gakpo', 'position': 'FW', 'club': 'Liverpool', 'goals': 16, 'assists': 10, 'rating': 83, 'form': 8.0},
        {'name': 'Xavi Simons', 'position': 'MF', 'club': 'RB Leipzig', 'goals': 12, 'assists': 15, 'rating': 85, 'form': 8.3},
        {'name': 'Frenkie de Jong', 'position': 'MF', 'club': 'Barcelona', 'goals': 4, 'assists': 9, 'rating': 86, 'form': 7.9},
        {'name': 'Virgil van Dijk', 'position': 'DF', 'club': 'Liverpool', 'goals': 4, 'assists': 2, 'rating': 88, 'form': 8.6},
        {'name': 'Bart Verbruggen', 'position': 'GK', 'club': 'Brighton', 'goals': 0, 'assists': 0, 'rating': 81, 'form': 7.8}
    ],
    'Norway': [
        {'name': 'Erling Haaland', 'position': 'FW', 'club': 'Man City', 'goals': 48, 'assists': 8, 'rating': 93, 'form': 9.4},
        {'name': 'Martin Ødegaard', 'position': 'MF', 'club': 'Arsenal', 'goals': 14, 'assists': 16, 'rating': 89, 'form': 8.8},
        {'name': 'Alexander Sørloth', 'position': 'FW', 'club': 'Atletico Madrid', 'goals': 18, 'assists': 5, 'rating': 82, 'form': 7.9},
        {'name': 'Antonio Nusa', 'position': 'FW', 'club': 'RB Leipzig', 'goals': 8, 'assists': 10, 'rating': 80, 'form': 8.1},
        {'name': 'Leo Østigård', 'position': 'DF', 'club': 'Rennes', 'goals': 3, 'assists': 0, 'rating': 78, 'form': 7.4},
        {'name': 'Ørjan Nyland', 'position': 'GK', 'club': 'Sevilla', 'goals': 0, 'assists': 0, 'rating': 78, 'form': 7.5}
    ],
    'Uruguay': [
        {'name': 'Darwin Núñez', 'position': 'FW', 'club': 'Liverpool', 'goals': 22, 'assists': 10, 'rating': 83, 'form': 8.1},
        {'name': 'Federico Valverde', 'position': 'MF', 'club': 'Real Madrid', 'goals': 9, 'assists': 12, 'rating': 88, 'form': 8.9},
        {'name': 'Luis Suárez', 'position': 'FW', 'club': 'Inter Miami', 'goals': 18, 'assists': 7, 'rating': 80, 'form': 7.7},
        {'name': 'Rodrigo Bentancur', 'position': 'MF', 'club': 'Tottenham', 'goals': 5, 'assists': 6, 'rating': 81, 'form': 7.8},
        {'name': 'Ronald Araújo', 'position': 'DF', 'club': 'Barcelona', 'goals': 2, 'assists': 1, 'rating': 86, 'form': 8.2},
        {'name': 'Sergio Rochet', 'position': 'GK', 'club': 'Internacional', 'goals': 0, 'assists': 0, 'rating': 80, 'form': 7.9}
    ],
    'USA': [
        {'name': 'Christian Pulisic', 'position': 'FW', 'club': 'AC Milan', 'goals': 18, 'assists': 12, 'rating': 84, 'form': 8.6},
        {'name': 'Folarin Balogun', 'position': 'FW', 'club': 'Monaco', 'goals': 12, 'assists': 4, 'rating': 79, 'form': 7.3},
        {'name': 'Weston McKennie', 'position': 'MF', 'club': 'Juventus', 'goals': 5, 'assists': 9, 'rating': 80, 'form': 7.8},
        {'name': 'Tyler Adams', 'position': 'MF', 'club': 'Bournemouth', 'goals': 1, 'assists': 3, 'rating': 78, 'form': 7.5},
        {'name': 'Antonee Robinson', 'position': 'DF', 'club': 'Fulham', 'goals': 2, 'assists': 7, 'rating': 80, 'form': 8.0},
        {'name': 'Matt Turner', 'position': 'GK', 'club': 'Crystal Palace', 'goals': 0, 'assists': 0, 'rating': 77, 'form': 7.2}
    ],
    'Canada': [
        {'name': 'Jonathan David', 'position': 'FW', 'club': 'Lille', 'goals': 24, 'assists': 6, 'rating': 83, 'form': 8.4},
        {'name': 'Alphonso Davies', 'position': 'DF', 'club': 'Bayern Munich', 'goals': 4, 'assists': 10, 'rating': 85, 'form': 8.2},
        {'name': 'Cyle Larin', 'position': 'FW', 'club': 'Mallorca', 'goals': 9, 'assists': 4, 'rating': 76, 'form': 7.0},
        {'name': 'Stephen Eustáquio', 'position': 'MF', 'club': 'Porto', 'goals': 5, 'assists': 7, 'rating': 78, 'form': 7.5},
        {'name': 'Alistair Johnston', 'position': 'DF', 'club': 'Celtic', 'goals': 2, 'assists': 5, 'rating': 76, 'form': 7.4},
        {'name': 'Maxime Crépeau', 'position': 'GK', 'club': 'Portland Timbers', 'goals': 0, 'assists': 0, 'rating': 75, 'form': 7.1}
    ],
    'Mexico': [
        {'name': 'Santiago Giménez', 'position': 'FW', 'club': 'Feyenoord', 'goals': 26, 'assists': 6, 'rating': 82, 'form': 8.0},
        {'name': 'Hirving Lozano', 'position': 'FW', 'club': 'San Diego FC', 'goals': 11, 'assists': 8, 'rating': 79, 'form': 7.4},
        {'name': 'Edson Álvarez', 'position': 'MF', 'club': 'West Ham', 'goals': 4, 'assists': 5, 'rating': 81, 'form': 7.9},
        {'name': 'Luis Chávez', 'position': 'MF', 'club': 'Dynamo Moscow', 'goals': 6, 'assists': 6, 'rating': 77, 'form': 7.5},
        {'name': 'Johan Vásquez', 'position': 'DF', 'club': 'Genoa', 'goals': 2, 'assists': 1, 'rating': 77, 'form': 7.6},
        {'name': 'Guillermo Ochoa', 'position': 'GK', 'club': 'AVS', 'goals': 0, 'assists': 0, 'rating': 76, 'form': 7.2}
    ],
    'Croatia': [
        {'name': 'Luka Modrić', 'position': 'MF', 'club': 'Real Madrid', 'goals': 4, 'assists': 10, 'rating': 85, 'form': 8.1},
        {'name': 'Andrej Kramarić', 'position': 'FW', 'club': 'Hoffenheim', 'goals': 15, 'assists': 6, 'rating': 80, 'form': 7.7},
        {'name': 'Mateo Kovačić', 'position': 'MF', 'club': 'Man City', 'goals': 5, 'assists': 7, 'rating': 82, 'form': 8.0},
        {'name': 'Ivan Perišić', 'position': 'FW', 'club': 'PSV Eindhoven', 'goals': 6, 'assists': 8, 'rating': 77, 'form': 7.2},
        {'name': 'Joško Gvardiol', 'position': 'DF', 'club': 'Man City', 'goals': 5, 'assists': 4, 'rating': 87, 'form': 8.6},
        {'name': 'Dominik Livaković', 'position': 'GK', 'club': 'Fenerbahce', 'goals': 0, 'assists': 0, 'rating': 81, 'form': 7.8}
    ]
}

# Lists of regional names for generating squads
REGIONAL_NAMES = {
    'European': {
        'first': ['Jan', 'Pavel', 'Tomas', 'Luka', 'Marko', 'Filip', 'Ivan', 'Stefan', 'David', 'Peter', 'Jakub', 'Martin', 'Daniel', 'Andrej', 'Robert', 'Emil', 'Viktor', 'Nikola'],
        'last': ['Horvat', 'Kovac', 'Novak', 'Svoboda', 'Bilic', 'Modric', 'Varga', 'Nagy', 'Petrovic', 'Kovacevic', 'Jankovic', 'Dvorak', 'Cerny', 'Prochazka', 'Krejci', 'Suler']
    },
    'LatinAmerican': {
        'first': ['Santiago', 'Mateo', 'Sebastian', 'Matias', 'Nicolas', 'Alejandro', 'Diego', 'Gabriel', 'Lucas', 'Juan', 'Luis', 'Carlos', 'Jose', 'Andres', 'Felipe', 'Thiago'],
        'last': ['Rodriguez', 'Gonzalez', 'Gomez', 'Fernandez', 'Lopez', 'Diaz', 'Martinez', 'Perez', 'Garcia', 'Sanchez', 'Romero', 'Alvarez', 'Torres', 'Ruiz', 'Silva', 'Castro']
    },
    'African': {
        'first': ['Moussa', 'Abdoulaye', 'Sadio', 'Koffi', 'Yaya', 'Samuel', 'Didier', 'Emmanuel', 'Idrissa', 'Cheikh', 'Victor', 'Chinedu', 'Kojo', 'Ayite', 'Kofi', 'Ousmane'],
        'last': ['Diallo', 'Traore', 'Koulibaly', 'Mendy', 'Sarr', 'Sow', 'Barrow', 'Mensah', 'Gyan', 'Osei', 'Touré', 'Koné', 'Fofana', 'Diop', 'Camara', 'Ndiaye']
    },
    'Arab': {
        'first': ['Mohammed', 'Ahmed', 'Youssef', 'Ali', 'Omar', 'Hamza', 'Ibrahim', 'Mustafa', 'Khalid', 'Hassan', 'Saad', 'Yassine', 'Salem', 'Fahad', 'Aymen', 'Tarek'],
        'last': ['Al-Dawsari', 'Al-Shehri', 'Al-Muwallad', 'Mansour', 'Haddad', 'Gharbi', 'Fathi', 'Salah', 'Slimani', 'Mahrez', 'Bounou', 'En-Nesyri', 'Hakimi', 'Ziyech']
    },
    'Asian': {
        'first': ['Min-jae', 'Heung-min', 'Kang-in', 'Gue-sung', 'Jae-sung', 'Hiroki', 'Takefusa', 'Wataru', 'Kaoru', 'Daichi', 'Kyogo', 'Jasur', 'Eldor', 'Otabek', 'Abbosbek'],
        'last': ['Kim', 'Lee', 'Park', 'Son', 'Choi', 'Tanaka', 'Ito', 'Kubo', 'Endo', 'Mitoma', 'Kamada', 'Shomurodov', 'Masharipov', 'Jaloliddinov', 'Karimov']
    },
    'English': {
        'first': ['Jack', 'Harry', 'John', 'Thomas', 'James', 'William', 'Oliver', 'George', 'Charlie', 'Mason', 'Declan', 'Marcus', 'Ben', 'Luke', 'Sam', 'Ryan'],
        'last': ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Kane', 'Stone', 'Rice']
    }
}

CLUBS = [
    'Man City', 'Real Madrid', 'Barcelona', 'Bayern Munich', 'Arsenal', 'PSG', 'Liverpool',
    'Inter Milan', 'Juventus', 'AC Milan', 'Atletico Madrid', 'Dortmund', 'Leverkusen',
    'Aston Villa', 'Newcastle', 'Chelsea', 'Man United', 'Tottenham', 'Feyenoord', 'Ajax',
    'Porto', 'Benfica', 'Sporting CP', 'Lille', 'Marseille', 'Monaco', 'AS Roma', 'Lazio',
    'Napoli', 'Sevilla', 'Real Sociedad', 'Athletic Bilbao', 'Galatasaray', 'Fenerbahce', 'Celtic'
]

# Map team name to its region for realistic generation
TEAM_REGIONS = {
    'South Africa': 'African', 'Morocco': 'Arab', 'Haiti': 'LatinAmerican',
    'Australia': 'English', 'Paraguay': 'LatinAmerican', 'Turkey': 'Arab',
    'Ecuador': 'LatinAmerican', 'Ivory Coast': 'African', 'Curacao': 'LatinAmerican',
    'Japan': 'Asian', 'Tunisia': 'Arab', 'Sweden': 'European',
    'Belgium': 'European', 'Iran': 'Arab', 'Egypt': 'Arab', 'New Zealand': 'English',
    'Saudi Arabia': 'Arab', 'Cape Verde': 'African', 'Senegal': 'African', 'Iraq': 'Arab',
    'Austria': 'European', 'Algeria': 'Arab', 'Jordan': 'Arab',
    'Colombia': 'LatinAmerican', 'Uzbekistan': 'Asian', 'DR Congo': 'African',
    'Ghana': 'African', 'Panama': 'LatinAmerican', 'Switzerland': 'European',
    'Czechia': 'European', 'Bosnia and Herzegovina': 'European', 'Qatar': 'Arab',
    'South Korea': 'Asian', 'Scotland': 'English'
}

def generate_player(team, position, index, region, team_tier):
    """Generate a realistic player based on team rating tier and position."""
    first_names = REGIONAL_NAMES[region]['first']
    last_names = REGIONAL_NAMES[region]['last']
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    # Rating range based on team tier
    if team_tier == 'A':    # e.g., Switzerland, Belgium
        rating_min, rating_max = 80, 87
    elif team_tier == 'B':  # e.g., Ecuador, Japan, Morocco
        rating_min, rating_max = 76, 82
    elif team_tier == 'C':  # e.g., Egypt, Saudi Arabia, Scotland
        rating_min, rating_max = 72, 78
    else:                   # e.g., Haiti, Curacao, Jordan
        rating_min, rating_max = 65, 73
        
    rating = random.randint(rating_min, rating_max)
    form = round(random.uniform(6.5, 9.0), 1)
    club = random.choice(CLUBS)
    
    # Statistics based on position
    if position == 'FW':
        goals = random.randint(12, 32) if team_tier in ['A', 'B'] else random.randint(6, 18)
        assists = random.randint(4, 15) if team_tier in ['A', 'B'] else random.randint(2, 8)
    elif position == 'MF':
        goals = random.randint(4, 12) if team_tier in ['A', 'B'] else random.randint(2, 7)
        assists = random.randint(8, 20) if team_tier in ['A', 'B'] else random.randint(3, 10)
    elif position == 'DF':
        goals = random.randint(1, 4)
        assists = random.randint(1, 6)
    else: # GK
        goals = 0
        assists = 0
        
    return {
        'name': name,
        'position': position,
        'club': club,
        'goals': goals,
        'assists': assists,
        'rating': rating,
        'form': form
    }

def main():
    squads_db = {}
    
    # Tier mapping for team generation
    team_tiers = {
        'Belgium': 'A', 'Switzerland': 'A', 'Colombia': 'A', 'Czechia': 'B',
        'Morocco': 'B', 'Japan': 'B', 'Sweden': 'B', 'Ecuador': 'B', 'Austria': 'B',
        'South Korea': 'B', 'Turkey': 'B', 'Ghana': 'B', 'Senegal': 'B',
        'Australia': 'C', 'Scotland': 'C', 'Paraguay': 'C', 'Egypt': 'C',
        'Bosnia and Herzegovina': 'C', 'Ivory Coast': 'C', 'Algeria': 'C', 'Uzbekistan': 'C',
        'Tunisia': 'C', 'South Africa': 'C', 'DR Congo': 'C', 'Saudi Arabia': 'C',
        'Haiti': 'D', 'Curacao': 'D', 'Panama': 'D', 'Iraq': 'D', 'Qatar': 'D',
        'Jordan': 'D', 'New Zealand': 'D', 'Cape Verde': 'D'
    }
    
    for team in TEAMS_LIST:
        if team in REAL_SQUADS:
            squads_db[team] = REAL_SQUADS[team]
        else:
            region = TEAM_REGIONS.get(team, 'European')
            tier = team_tiers.get(team, 'C')
            
            # Generate 6 players: 2 FW, 2 MF, 1 DF, 1 GK
            squad = [
                generate_player(team, 'FW', 1, region, tier),
                generate_player(team, 'FW', 2, region, tier),
                generate_player(team, 'MF', 1, region, tier),
                generate_player(team, 'MF', 2, region, tier),
                generate_player(team, 'DF', 1, region, tier),
                generate_player(team, 'GK', 1, region, tier)
            ]
            
            # Ensure index 0 has the highest goal scorer for Golden Boot predictions
            squad.sort(key=lambda p: (p['position'] != 'FW', -p['goals']))
            squads_db[team] = squad

    # Save to JSON in data/raw
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'squads_db.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(squads_db, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated squads database for {len(squads_db)} teams and saved to {output_path}")

if __name__ == '__main__':
    main()
