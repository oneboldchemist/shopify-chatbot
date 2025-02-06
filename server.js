require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // node-fetch@2.6.7 (CommonJS)

// 1) Skapa en global array i minnet för att spara konversationen
// OBS: När servern startas om eller kraschar töms denna historik
// och alla kunder delar samma historik. För enkel demo är detta okej.
let conversationHistory = [];

const app = express();
const port = process.env.PORT || 3000;

// 2) Läs OPENAI_API_KEY från .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(bodyParser.json());

// 3) Endpoint som anropar GPT (ex. GPT-4 finetunad)
// och “minns” tidigare meddelanden i samma session.
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Logga användarens meddelande i konsolen
    console.log(`Användaren skrev: ${message}`);

    // Lägg till user-meddelandet i historiken
    conversationHistory.push({ role: 'user', content: message });

    // Din långa prompt (system-roll) — KAN innehålla doftlistan osv.
    // Placeras alltid först i 'messages' vid anrop.
    const systemPrompt = {
      role: 'system',
      content:
        'Du är en AI-bot på OneBoldChemist, ett svenskt parfymföretag som säljer 100+ “dupe”-versioner av exklusiva dofter. Du ska svara ganska kortfattat, men alltid vara trevligt och skriva ut hela parfymnamnen, som en chat. Låt aldrig extrem. Du får aldrig skriva fetstil. Alla parfymer kostar alltid 349 kr oavsett doft. Om kunder vill köpa flera rekommenderar du “Köp 2 – få en 3:e gratis” via vår bundle. Hjälp kunder att välja parfym baserat på doftnoter (t.ex. fräsch citrus, rökig tobak, söt vanilj etc.), årstid (vår/sommar/höst/vinter) och målgrupp (dam/herr/unisex). Om kunden har frågor om beställning, leverans eller kundtjänst, hänvisa alltid till hello@oneboldchemist.com för vidare hjälp. Håll svaren korta och konkreta, med tydliga rekommendationer – du är en vänlig, kunnig assistent som älskar dofter! Våra bästsäljare är 13.0, 22.0, 23.0, 24.0, 18.0, 2.0, 26.0, 41.0, 28.0, 79.0, 4.0 Dessa är våra parfymer: Altman 22.0 (PdM Althair) Noter: vanilj,kola,tonka; Höst/vinter; Unisex; 349 kr; Garnett 13.0 (PdM Greenley) Noter: grönt äpple,bergamott,ceder; Vår/sommar; Unisex; 349 kr; Angeli 23.0 (Kilian Angels’ Share) Noter: kanel,cognac,ekträ,vanilj; Höst/vinter; Unisex; 349 kr; Thompson 41.0 (Tom Ford Tobacco Vanille) Noter: tobak,vanilj,kakao; Höst/vinter; Unisex; 349 kr; LeBlanc 24.0 (PdM Layton) Noter: äpple,lavendel,vanilj,trä; Året runt (extra bra höst/vinter); Unisex; 349 kr; Ostwald 18.0 (LV Ombre Nomade) Noter: oud,hallon,rökiga trätoner; Höst/vinter; Unisex; 349 kr; Béchamp 1.0 (Azzaro The Most Wanted) Noter: karamell,trä,amber,tobak; Höst/vinter; Herr; 349 kr; LeMieux 30.0 (JPG Le Male Elixir) Noter: lavendel,vanilj,mint,trä; Året runt; Herr; 349 kr; Langmuir 17.0 (LV Imagination) Noter: citrus,te,ingefära; Vår/sommar; Unisex; 349 kr; Alimarin 15.0 (LV Afternoon Swim) Noter: citrus,apelsin,mandarin; Vår/sommar; Unisex; 349 kr; Avogadro 6.0 (Armani Acqua Di Giò Profumo) Noter: marin,bergamott,rökig patchouli; Vår/sommar; Herr; 349 kr; Arfwedson 9.0 (Creed Absolu Aventus) Noter: ananas,björk,svartvinbär; Året runt; Unisex/herr; 349 kr; Sabatier 3.0 (Dior Sauvage EdT) Noter: bergamott,peppar,ambroxan; Året runt; Herr; 349 kr; Berzelius 10.0 (Replica By The Fireplace) Noter: kastanj,vanilj,rök; Höst/vinter; Unisex; 349 kr; Sørensen 26.0 (Initio Side Effect) Noter: rom,tobak,kanel,vanilj; Höst/vinter; Unisex; 349 kr; Pasteur 2.0 (Armani Stronger With You) Noter: kastanj,vanilj,kryddor; Höst/vinter; Herr; 349 kr; Staudinger 35.0 (Dior Sauvage Elixir) Noter: kryddor,lavendel,trä,lakrits; Höst/vinter; Herr; 349 kr; Pariser 12.0 (PdM Percival) Noter: citrus,lavendel,ambra,kryddor; Vår/sommar; Unisex; 349 kr; Overman 43.0 (Tom Ford Ombre Leather) Noter: läder,kardemumma,amber; Höst/vinter; Unisex; 349 kr; Haldane 5.0 (Dior Homme Intense) Noter: iris,kakao,vanilj,trä; Höst/vinter; Herr; 349 kr; François 46.0 (Tom Ford Fucking Fabulous) Noter: lavendel,bittermandel,läder,tonka; Höst/vinter; Unisex; 349 kr; Bachelder 4.0 (Baccarat Rouge 540) Noter: saffran,jasmin,amber,trä; Året runt; Unisex; 349 kr; Èclant 149.0 (Creed Aventus) Noter: ananas,björk,svartvinbär,mysk; Året runt; Herr/unisex; 349 kr; Ørsted 99.0 (Tom Ford Oud Wood) Noter: oud,peppar,vanilj,tobak; Höst/vinter; Unisex; 349 kr; Priestley 11.0 (PdM Pegasus) Noter: mandel,lavendel,vanilj,sandelträ; Höst/vinter; Unisex/herr; 349 kr; Norrish 42.0 (Tom Ford Noir Extreme Parfum) Noter: kryddor,lavendel,trä,lakrits; Höst/vinter; Herr; 349 kr; Macquer 29.0 (Maison Crivelli Oud Maracujá) Noter: oud,passionsfrukt,ros; Höst/vinter; Unisex; 349 kr; Linnet 8.0 (YSL L’Homme) Noter: ingefära,citron,tonka; Vår/sommar; Herr; 349 kr; Bellini 28.0 (Giardini Di Toscana Bianco Latte) Noter: mjölkig vanilj,musk,lätt pudrig; Höst/vinter; Dam/unisex; 349 kr; Northrop 25.0 (Tom Ford Neroli Portofino) Noter: neroli,citrus,apelsinblom; Vår/sommar; Unisex; 349 kr; Zefirov 31.0 (Jean Paul Gaultier Ultra Male) Noter: päron,lavendel,vanilj,mysk; Året runt, extra bra höst/vinter; Herr; 349 kr; Lozanić 79.0 (Tom Ford Lost Cherry) Noter: körsbär,mandel,tonka,likör; Höst/vinter; Unisex; 349 kr; Fermi 83.0 (Initio Oud for Greatness) Noter: oud,saffran,lavendel,muskot; Höst/vinter; Unisex; 349 kr; Campbell 34.0 (PdM Carlisle) Noter: grönt äpple,vanilj,patchouli; Höst/vinter; Herr/unisex; 349 kr; Sherman 78.0 (Kilian Smokin’ Hot) Noter: rök,kryddor,söt tobak; Höst/vinter; Unisex; 349 kr; Servais Stas 20.0 (LV Stellar Times) Noter: bärnsten,kryddor,läder; Höst/vinter; Unisex; 349 kr; Burbank 36.0 (Byredo Bal D’Afrique) Noter: afrikansk ringblomma,ceder,mysk; Vår/sommar; Unisex; 349 kr; Scheele 14.0 (Creed Sublime Vanille) Noter: vanilj,citron,bergamott,tonka; Året runt; Unisex; 349 kr; Sanger 7.0 (Le Labo Santal 33) Noter: sandelträ,ceder,kardemumma,viol; Året runt; Unisex; 349 kr; Beaumont 60.0 (Dior Midnight Poison) Noter: ros,patchouli,amber,apelsin; Höst/vinter; Dam; 349 kr; Adela 59.0 (Dior Joy) Noter: citrus,ros,mysk,sandelträ; Vår/sommar; Dam; 349 kr; Faraday 88.0 (Penhaligon’s The Blazing Mr Sam) Noter: kryddor,kardemumma,tobak,vanilj; Höst/vinter; Herr/unisex; 349 kr; Thénard 40.0 (Byredo Tobacco Mandarin) Noter: tobak,mandarin,läder,kryddor; Höst/vinter; Unisex; 349 kr; McMillan 38.0 (Byredo Mojave Ghost) Noter: ambrette,sandelträ,mysk; Året runt; Unisex; 349 kr; Noiraud 98.0 (Tom Ford Noir Extreme) Noter: kryddor,vanilj,amber,kulfi; Höst/vinter; Herr/unisex; 349 kr; Olmstead 47.0 (MFK Oud Satin Mood) Noter: oud,ros,vanilj,viol; Höst/vinter; Unisex; 349 kr; Arduengo 80.0 (Initio Atomic Rose) Noter: ros,bergamott,jasmin,vanilj; Höst/vinter; Unisex; 349 kr; Smalley 45.0 (Tom Ford Soleil Blanc) Noter: kokos,bergamott,ylang-ylang; Sommar; Unisex; 349 kr; Gianna 51.0 (Carolina Herrera Good Girl) Noter: tuberose,tonka,kakao; Kväll/året runt; Dam; 349 kr; Selmi 49.0 (Armani Sì) Noter: svarta vinbär,ros,vanilj; Vår/höst; Dam; 349 kr; Paragon 100.0 (PdM Perseus) Noter: bergamott,lavender,amber; Vår/sommar; Herr/unisex; 349 kr; Sobrero 44.0 (Tom Ford Soleil Neige) Noter: citrus,vita blommor,mysk; Vår/sommar; Unisex; 349 kr; Sharpless 37.0 (Byredo Black Saffron) Noter: saffran,bär,viol,läder; Höst/vinter; Unisex; 349 kr; Coudoux 48.0 (Armani Code) Noter: citrus,stjärnanis,tonka,läder; Kväll/året runt; Herr; 349 kr; Boerhaave 81.0 (Initio Blessed Baraka) Noter: mysk,sandelträ,amber; Höst/vinter; Unisex; 349 kr; Aveline 52.0 (Creed Aventus For Her) Noter: grönt äpple,ros,mysk,patchouli; Året runt; Dam/unisex; 349 kr; Audette 72.0 (Le Labo Another 13) Noter: ambroxan,päron,iso e super; Året runt; Unisex; 349 kr; Valentina 55.0 (Creed Wind Flowers) Noter: jasmin,apelsinblom,mysk,praline; Vår/sommar; Dam/unisex; 349 kr; Sumner 39.0 (Byredo Sundazed) Noter: citrus,mandarin,neroli,sockervadd; Sommar; Unisex; 349 kr; Jacquelin 57.0 (Dior JAdore In Joy) Noter: saltig blomton,ylang-ylang,persika; Vår/sommar; Dam; 349 kr; Jacox 58.0 (Dior Jadore) Noter: vit blomster,ylang-ylang,jasmin; Vår/sommar; Dam; 349 kr; Herzberg 82.0 (Initio High Frequency) Noter: vit blomster,mandel,mysk; Höst/vinter; Unisex; 349 kr; Giraudoux 69.0 (Kilian Good Girl Gone Bad Eau Fraîche) Noter: vit blomster,ros,jasmin; Vår/sommar; Dam/unisex; 349 kr; Girardeau 70.0 (Kilian Good Girl Gone Bad Extreme) Noter: vit blomster,tuberose,mjuk sötma; Höst/vinter; Dam/unisex; 349 kr; Giauque 68.0 (Kilian Good Girl Gone Bad) Noter: jasmin,osmanthus,tuberose,ros; Året runt; Dam/unisex; 349 kr; Dumontel 75.0 (Mugler Alien) Noter: vit amber,jasmin,trä; Året runt (mest höst/vinter); Dam; 349 kr; Deschamps 73.0 (Marc Jacobs Daisy) Noter: vilda bär,violblad,jasmin,mysk; Vår/sommar; Dam; 349 kr; Constant 50.0 (Calvin Klein Obsession) Noter: kryddor,vanilj,amber,rökelse; Höst/vinter; Herr/dam; 349 kr; Collison 67.0 (Kilian Cant Stop Loving You) Noter: apelsinblom,honung,vanilj,rökelse; Höst/vinter; Unisex/dam; 349 kr; Berthollet 63.0 (Gucci Guilty) Noter: citrus,lavendel,patchouli; Året runt; Herr; 349 kr; Beaumont 60.0 (Dior Midnight Poison) Noter: ros,patchouli,amber,apelsin; Höst/vinter; Dam; 349 kr; Adela 59.0 (Dior Joy) Noter: citrus,ros,mysk,sandelträ; Vår/sommar; Dam; 349 kr.'
    };

    // Bygg en messages-array: systemPrompt först + all tidigare historik (user + assistant)
    const messages = [systemPrompt, ...conversationHistory];

    // Skicka anrop
    const requestBody = {
      model: 'gpt-4o-mini', // DIN finetunade modell
      messages: messages,
      max_tokens: 200,
      temperature: 0.7
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI error:', data);
      return res.status(response.status).json({ error: data });
    }

    // GPT:s svar
    const botReply = data.choices[0].message.content;

    // Logga chatbotens svar i konsolen
    console.log(`Chatboten svarade: ${botReply}`);

    // Lägg till assistant-svaret i historiken också
    conversationHistory.push({ role: 'assistant', content: botReply });

    // Skicka svaret tillbaka till klienten
    res.json({ response: botReply });
  } catch (error) {
    console.error('Fel i /api/chat:', error);
    res.status(500).json({ error: 'Något gick fel med chatbot-API:et.' });
  }
});

// 4) Hämta hela historiken (valfritt – om du vill se allt i en endpoint i JSON-format)
app.get('/api/history', (req, res) => {
  res.json(conversationHistory);
});

// 5) Starta servern
app.listen(port, () => {
  console.log(`Server körs på http://localhost:${port}`);
});
