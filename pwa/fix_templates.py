import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# Find all places where a bare backtick template literal was placed outside ${}
# Pattern: ` followed by <div style=... initial-letter code ... followed by `
# These need to be converted to plain HTML (no wrapping backticks)

# Fix 1: Album sub-row thumbnail (line ~514 area)
# Find: `<div style=\"width:100%;height:100%;display:flex;...\">...esc(alb.name.charAt(0))...</div>`
# Replace with: <div style=\"width:100%;height:100%;display:flex;...\">...${esc(alb.name.charAt(0))}...</div>
# (Remove wrapping backticks)

# Pattern: backtick-div-initial-letter-backtick where it's NOT inside ${}
# These all follow the pattern: backtick + <div style=...> + ${esc(...)} + </div> + backtick

# Find lines with the broken pattern
pattern = r"`<div style=\"width:100%;height:100%;(?:display:flex;align-items:center;justify-content:center;)?(?:background:linear-gradient\(135deg,var\(--accent\),var\(--accent2\)\);)?font-size:\d+px;font-weight:700;color:#fff\">\$\{esc\([^)]+\)\}</div>`"

matches = list(re.finditer(pattern, content))
print(f"Found {len(matches)} broken bare template literals")

for match in matches:
    broken = match.group()
    # Remove wrapping backticks
    fixed = broken[1:-1]  # strip the outer backticks
    print(f"  Fixing: {broken[:80]}...")
    content = content.replace(broken, fixed, 1)
    changes += 1

# Fix 2: Album hero blurred bg - stray single quotes  
# Pattern: '<div style=\"position:absolute;inset:0;background:linear-gradient(135deg,#1a2535,#0d1b28)\"></div>'
old_hero_bg = "'<div style=\"position:absolute;inset:0;background:linear-gradient(135deg,#1a2535,#0d1b28)\"></div>'"
new_hero_bg = "<div style=\"position:absolute;inset:0;background:linear-gradient(135deg,#1a2535,#0d1b28)\"></div>"
if old_hero_bg in content:
    content = content.replace(old_hero_bg, new_hero_bg)
    print("  Fixing hero blurred bg stray quotes")
    changes += 1

# Fix 3: Also check if there's a broken `<div style=...np-art-initial...> line that has stray backtick
# These come from the earlier replacement of the now-playing art box

# Write the fixed content
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nTotal fixes: {changes}")
