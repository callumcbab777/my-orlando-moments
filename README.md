# My Orlando · Moments

Internal concept demo (ABI Group / AMBAR Orlando) of the **My Orlando → Moments** area of the buyer portal: seven Moments, each a fillable, one-screen-at-a-time experience (tap cards, three-state chips, sliders, toggles, steppers, image picks, A/B pairs, season picker, rarely-to-often sliders, voice-note text). Finishing a Moment adds its tile to the board and shows a templated "Made for you" card; finishing Orlando Days drops starter pins onto the Explore → Discover Orlando map (Leaflet, bundled; OpenStreetMap tiles need internet), also listed under Saved, where places can be pinned/unpinned; the Your Orlando panel writes an editable, printable summary. Answers live only in the viewer's browser (localStorage); "Reset demo" in the footer clears them. No AI calls, nothing is sent.

Fully static and self-contained: fonts (Cormorant Garamond, DM Sans — SIL OFL), AMBAR logo and photos are bundled. No CDN, no tracking. Open `index.html` or serve the folder.

## Image credits
All images are colour-graded (warm, slightly desaturated) and resized for the web.

| File | Image | Author / owner | License | Source |
|---|---|---|---|---|
| assets/img/why-orlando.jpg | Lake Eola Lake, Orlando Florida.jpg | DoctorDotDJ | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Lake_Eola_Lake,_Orlando_Florida.jpg |
| assets/img/orlando-days.jpg | Falcons Fire Golf Course in Orlando.jpg | ReunionVacationHomes.com | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Falcons_Fire_Golf_Course_in_Orlando.jpg |
| assets/img/hotel-feeling.jpg | AMBAR rendering (services.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/picture-it.jpg | AMBAR rendering (slide-04.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/on-your-mind.jpg | Coffee and coffee cake (Unsplash).jpg | Stephanie McCabe | CC0 | https://commons.wikimedia.org/wiki/File:Coffee_and_coffee_cake_(Unsplash).jpg |
| assets/img/your-visit.jpg | AMBAR rendering (header-03.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/whos-part.jpg | Outdoor wine dinner (Unsplash).jpg | Serge Esteve | CC0 | https://commons.wikimedia.org/wiki/File:Outdoor_wine_dinner_(Unsplash).jpg |
| assets/img/x-pool.jpg | AMBAR rendering (resort-pools.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/x-golf.jpg | Falcons Fire Golf Course in Orlando.jpg | ReunionVacationHomes.com | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Falcons_Fire_Golf_Course_in_Orlando.jpg |
| assets/img/x-spa.jpg | AMBAR rendering (aj-Wellness-Fitness.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/x-v-lake.jpg | Black and White Swans at Lake Eola.jpg | LeonidasB | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Black_and_White_Swans_at_Lake_Eola.jpg |
| assets/img/x-v-pool.jpg | AMBAR rendering (pool-zoom.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/x-v-skyline.jpg | OrlandoFLsunsetskyline.jpg | Steve Willis | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:OrlandoFLsunsetskyline.jpg |
| assets/img/x-loft.jpg | Furnished living room. (Unsplash).jpg | Stephen Di Donato | CC0 | https://commons.wikimedia.org/wiki/File:Furnished_living_room._(Unsplash).jpg |
| assets/img/x-bright.jpg | AMBAR rendering (imagen-resident-04-home-AJ.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/x-bcalm.jpg | AMBAR rendering (slide-02.webp) | AMBAR Residences Orlando | Courtesy of AMBAR — internal team use only | https://ambarorlando.com/ |
| assets/img/x-balcony.jpg | Morning coffee (Unsplash).jpg | Ian Keefe | CC0 | https://commons.wikimedia.org/wiki/File:Morning_coffee_(Unsplash).jpg |
| assets/img/x-ropedrop.jpg | Amusement park atCleveland in summer (Unsplash).jpg | Hannah Morgan | CC0 | https://commons.wikimedia.org/wiki/File:Amusement_park_atCleveland_in_summer_(Unsplash).jpg |
| assets/img/x-laptop.jpg | Laptops and plants on terrace (Unsplash).jpg | rawpixel.com | CC0 | https://commons.wikimedia.org/wiki/File:Laptops_and_plants_on_terrace_(Unsplash).jpg |
| assets/img/x-v-palms.jpg | Palm trees on a white beach (Unsplash).jpg | Love Maldives | CC0 | https://commons.wikimedia.org/wiki/File:Palm_trees_on_a_white_beach_(Unsplash).jpg |
| assets/img/x-bbold.jpg | Bedroom window (Unsplash).jpg | Viktoria Hall-Waldhauser | CC0 | https://commons.wikimedia.org/wiki/File:Bedroom_window_(Unsplash).jpg |
| assets/img/x-kmodern.jpg | Blue white kitchen interior (Unsplash).jpg | NeONBRAND | CC0 | https://commons.wikimedia.org/wiki/File:Blue_white_kitchen_interior_(Unsplash).jpg |
| assets/img/x-krustic.jpg | Kitchen table (Unsplash).jpg | Clem Onojeghuo | CC0 | https://commons.wikimedia.org/wiki/File:Kitchen_table_(Unsplash).jpg |

CC0 photos are Unsplash uploads mirrored on Wikimedia Commons. CC BY / CC BY-SA photos are adapted (resized, colour-graded); adaptations of CC BY-SA images are shared under the same licence. AMBAR renderings are AMBAR's own imagery, used courtesy of AMBAR for this internal demo — confirm permission before any external use.

## Palette (AMBAR brand)
Olive #5A5A37, light green #989B74, brown #B37D50, light cream #F4EFE7, amber #FFA94A, dark #171717 / #010101 — from the custom properties in ambarorlando.com's CSS; forest #0F2D21 sampled from the AMBAR logo.

## Map data
Place coordinates from OpenStreetMap Nominatim (Oct 15 2026). AMBAR marker: 3251 Secret Lake Drive, Kissimmee (address from public listings); OSM has no house number, so the marker sits on Secret Lake Drive at street level (approximate). Map tiles © OpenStreetMap contributors.
