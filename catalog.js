// Sample prices and source handles from SaaZone's public store. No live inventory.
const collections = [
  ["entire-men-collection", "Men’s Watches", "Everyday classics, dress watches and bold sports timepieces.", "orient-blue"],
  ["entire-ladies-collection", "Ladies’ Watches", "Discover refined dials, slim bracelets and classic leather straps.", "ltp-v004gl-9a"],
  ["titan-men", "Titan Men", "Find a Titan for the everyday or a special occasion.", "titan-ceramic"],
  ["titan-ladies", "Titan Ladies", "Explore Titan’s dress watches and expressive dials.", "2648qm03"],
  ["titan-edge", "Titan Edge", "Slim profiles and distinctive shapes from the Titan Edge collection.", "titan-blue"],
  ["casio", "Casio", "Analog favourites, digital classics and G-SHOCK timepieces.", "casio-gold"],
  ["orient", "Orient", "Explore the colours and character of Orient’s automatic watches.", "orient-mako"],
  ["casio-alarm-clocks", "Casio Alarm Clocks", "Practical bedside clocks with easy-to-read dials.", "clock-analog"],
].map(([id, name, description, cover]) => ({ id, name, description, cover }));

const men = "entire-men-collection";
const ladies = "entire-ladies-collection";
const titanMen = "titan-men";
const titanLadies = "titan-ladies";
const edge = "titan-edge";
const casio = "casio";
const orient = "orient";
const clocks = "casio-alarm-clocks";

const products = [
  ["orient-blue", "Orient Mako Divers", "Orient", "RA-AA0824L39B", 64000, "orient-automatic-mako-divers-for-men-ra-aa0824l39b", [men, orient], "An automatic Orient Mako with a blue dial, day and date display, and a steel bracelet."],
  ["orient-mako", "Orient Mako Divers Limited Edition", "Orient", "RA-AA0827V39B", 64000, "orient-automatic-mako-divers-for-men-ra-aa0827v39b-limited-edition", [men, orient], "This limited-edition Orient Mako pairs a violet dial with a dark bezel and steel bracelet."],
  ["ltp-v004gl-9a", "Casio Ladies Leather Belt", "Casio", "LTP-V004GL-9A", 6000, "casio-ladies-leather-belt-ltp-v004gl-9a", [ladies, casio], "A Casio analog watch with a warm gold-tone case, date display and brown leather strap."],
  ["ltp-v005d-2b", "Casio Ladies Stainless Steel Belt", "Casio", "LTP-V005D-2B", 6000, "casio-ladies-stainless-steel-belt-ltp-v005d-2b", [ladies, casio], "A pale blue dial with clear markers and a stainless-steel bracelet."],
  ["titan-squircle", "Titan Edge Squircle Unisex", "Titan", "1841NC01", 66000, "titan-edge-squircle-unisex-1841nc01", [edge, titanMen, titanLadies], "A slim black ceramic Titan Edge with a rounded square case and warm metallic hands."],
  ["titan-blue", "Titan Edge Squircle in Atlantic Blue Unisex", "Titan", "1841QC04", 64000, "titan-edge-squircle-in-atlantic-blue-unisex-1841qc04", [edge, titanMen, titanLadies], "The rounded-square Titan Edge in Atlantic Blue, with a minimalist dial and tonal bracelet."],
  ["titan-ceramic", "Titan Edge Ceramic for Men", "Titan", "1696NC12", 66000, "titan-edge-ceramic-quartz-watch-for-men-1696nc12", [edge, titanMen, titanLadies], "A black ceramic Titan Edge with an understated black dial and slim baton markers."],
  ["titan-neo", "Titan Neo Economy for Men", "Titan", "1802QL01", 8000, "", [men, titanMen], "A light-dial Titan dress watch with a dark strap and easy-to-read baton markers."],
  ["fastrack", "Titan Fastrack for Men", "Fastrack", "3123SL02", 5000, "titan-fastrack-for-men-3123sl02", [men, titanMen], "A casual Fastrack watch with a silver-tone dial and brown strap."],
  ["2648qm03", "Titan for Ladies", "Titan", "2648QM03", 18000, "fastrack-for-ladies-2648qm03", [ladies, titanLadies], "A Titan dress watch with a pale green dial, Roman numeral markers and a rose-tone bracelet."],
  ["2654wm01", "Titan Edge White Dial for Ladies", "Titan", "2654WM01", 22000, "titan-edge-white-dial-for-ladies-2654wm01", [ladies, titanLadies, edge], "A pared-back white dial paired with a rose-tone mesh bracelet."],
  ["2705wl01", "Titan Secluded Mother of Pearl Dial for Ladies", "Titan", "2705WL01", 13000, "titan-secluded-quartz-mother-of-pearl-dial-for-ladies-2705wl01", [ladies, titanLadies], "A blue mother-of-pearl dial framed by a gold-tone case and a light strap."],
  ["casio-steel", "Casio Men Stainless Steel Belt", "Casio", "MTP-1314D-1AVDF", 9000, "casio-men-stainless-steel-belt-m-24", [men, casio], "A stainless-steel Casio with a black dial, bold numerals and a date window."],
  ["casio-vintage", "Casio Vintage", "Casio", "A500WA-1DF", 9000, "", [men, casio], "A vintage-style Casio digital watch with a metal bracelet and world-time display."],
  ["casio-gold", "Casio Exclusive Stainless Steel for Men", "Casio", "MTP-1381G-1A", 14000, "casio-exclusive-stainless-steel-for-men-m-42", [men, casio], "A black Casio dial with a day and date display and a two-tone steel bracelet."],
  ["gshock-black", "Casio G-SHOCK Black-Out for Men", "Casio G-SHOCK", "GA-2100-1A1", 20000, "casio-g-shock-black-out-for-men-ga-2100-1a1", [men, casio], "An all-black analog-digital G-SHOCK with an octagonal bezel."],
  ["clock-analog", "Casio Alarm Clock", "Casio", "TQ 142 1", 3000, "casio-alarm-clock-tq-142-1", [clocks], "A square analog bedside alarm with an easy-to-read white dial."],
].map(([id, title, brand, model, price, source, collections, description]) =>
  ({ id, title, name: title + " " + model, brand, model, price, source, collections, description })
);
