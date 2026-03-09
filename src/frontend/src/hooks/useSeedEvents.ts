import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { HistoricalEvent } from "../backend.d.ts";
import { useActor } from "./useActor";

const EVENT_1453_CONSTANTINOPLE: HistoricalEvent = {
  id: "evt-1453-001",
  title: "Fall of Constantinople",
  year: BigInt(1453),
  exactDate: "May 29, 1453",
  locationName: "Constantinople (Istanbul), Ottoman Empire",
  latitude: 41.0082,
  longitude: 28.9784,
  region: "Europe",
  civilization: "Byzantine Empire / Ottoman Empire",
  category: "war",
  shortSummary:
    "The Ottoman Empire under Sultan Mehmed II captured Constantinople, ending the Byzantine Empire after over a thousand years.",
  fullDescription:
    "In 1453 CE, Ottoman Sultan Mehmed II led a massive siege of Constantinople, the capital of the Byzantine Empire. Using advanced siege artillery including enormous cannons capable of breaching the ancient Theodosian Walls, the Ottomans overwhelmed the outnumbered Byzantine defenders after a 53-day siege. The fall of Constantinople on May 29 marked the definitive end of the Byzantine Empire and the Eastern Roman legacy. It shifted control of major East-West trade routes to the Ottomans and sent shockwaves through Europe, accelerating efforts to find alternative sea routes to Asia and contributing to the start of the European Age of Exploration. Byzantine scholars fled westward to Italy, carrying Greek manuscripts and classical knowledge that fueled the Renaissance.",
  causes: [
    "Rapid expansion of the Ottoman Empire under Mehmed II",
    "Weakening of the Byzantine state through decades of civil war and loss of territory",
    "Development and deployment of advanced siege artillery (Orban's cannon)",
    "Failure of Western Christian powers to provide meaningful military aid",
  ],
  consequences: [
    "End of the Byzantine Empire and the Eastern Roman legacy",
    "Ottoman control over major trade routes between Europe and Asia",
    "Mass migration of Byzantine scholars to Italy carrying classical knowledge",
    "European powers accelerated search for sea routes to Asia (Age of Exploration)",
    "Byzantine manuscripts spread westward to be amplified by Gutenberg's printing press",
  ],
  keyFigures: [
    {
      name: "Sultan Mehmed II",
      role: "Ottoman Sultan who led the siege, later called 'The Conqueror'",
    },
    {
      name: "Emperor Constantine XI",
      role: "Last Byzantine Emperor, died defending the city",
    },
    {
      name: "Orban",
      role: "Hungarian cannon engineer who built the giant siege artillery for the Ottomans",
    },
  ],
  relatedEventIds: ["evt-1453-002"],
  sources: [
    "Steven Runciman, 'The Fall of Constantinople 1453' (1965)",
    "Roger Crowley, '1453: The Holy War for Constantinople' (2005)",
  ],
};

const EVENT_1453_GUTENBERG: HistoricalEvent = {
  id: "evt-1453-002",
  title: "Gutenberg Printing Revolution",
  year: BigInt(1453),
  exactDate: undefined,
  locationName: "Mainz, Holy Roman Empire (Germany)",
  latitude: 49.9929,
  longitude: 8.2473,
  region: "Europe",
  civilization: "Western Europe / Holy Roman Empire",
  category: "science",
  shortSummary:
    "Johannes Gutenberg's movable-type printing press transformed communication, enabling mass reproduction of texts and accelerating the spread of knowledge across Europe.",
  fullDescription:
    "Around 1450-1455, Johannes Gutenberg completed his revolutionary movable-type printing press in Mainz, Germany. By approximately 1453-1455, his workshop was producing the Gutenberg Bible, the first major book printed with movable metal type in Europe. This technology dramatically reduced the cost and time required to produce books, enabling ideas to spread at unprecedented speed. In the immediate aftermath of the Fall of Constantinople in 1453, Byzantine scholars fleeing to Italy brought classical manuscripts westward, and Gutenberg's press became the vehicle through which their knowledge was amplified and distributed across Europe, directly fueling the Renaissance and later the Protestant Reformation.",
  causes: [
    "Development of movable metal type and oil-based printing ink",
    "Growing demand for books among urban educated populations",
    "Expansion of universities and literate merchant classes in European cities",
    "Gutenberg's adaptation of existing screw-press technology",
  ],
  consequences: [
    "Mass production of books dramatically reducing their cost",
    "Rapid spread of Renaissance humanist ideas throughout Europe",
    "Enabled the Protestant Reformation by allowing Luther's works to reach mass audiences",
    "Amplification of classical knowledge brought by Byzantine scholars fleeing Constantinople",
    "Standardization of written languages and growth of national literatures",
  ],
  keyFigures: [
    {
      name: "Johannes Gutenberg",
      role: "German inventor who developed the movable-type printing press",
    },
    {
      name: "Johann Fust",
      role: "Financier who funded Gutenberg's workshop",
    },
  ],
  relatedEventIds: ["evt-1453-001"],
  sources: [
    "Elizabeth Eisenstein, 'The Printing Press as an Agent of Change' (1980)",
    "John Man, 'Gutenberg: How One Man Remade the World with Words' (2002)",
  ],
};

const EVENT_1456_BELGRADE: HistoricalEvent = {
  id: "evt-1456-001",
  title: "Siege of Belgrade",
  year: BigInt(1456),
  exactDate: "July 4–22, 1456",
  locationName: "Belgrade, Kingdom of Hungary (modern Serbia)",
  latitude: 44.8176,
  longitude: 20.4569,
  region: "Europe",
  civilization: "Kingdom of Hungary / Ottoman Empire",
  category: "war",
  shortSummary:
    "Christian forces under John Hunyadi repelled the Ottoman siege of Belgrade, halting Ottoman expansion into Central Europe for decades.",
  fullDescription:
    "In the summer of 1456, Sultan Mehmed II — fresh from his conquest of Constantinople three years earlier — turned his forces toward Belgrade, the key fortress guarding the road to Hungary and Western Europe. A crusading army led by Hungarian regent John Hunyadi and Franciscan friar John of Capistrano confronted the vastly larger Ottoman force. In a remarkable reversal, Hunyadi's forces broke the Ottoman siege on July 22, destroying much of the Ottoman fleet and compelling the Sultan to retreat. The victory was celebrated across Christendom and temporarily halted Ottoman advance into Central Europe. Both Hunyadi and John of Capistrano died of plague shortly after the battle.",
  causes: [
    "Ottoman Empire's continued westward expansion after the fall of Constantinople",
    "Strategic importance of Belgrade as the gateway to Hungary and Western Europe",
    "Pope Callixtus III's call for a crusade against the Ottomans",
    "Sultan Mehmed II's ambition to conquer Rome",
  ],
  consequences: [
    "Ottoman advance into Central Europe halted for over 70 years",
    "John Hunyadi died of plague weeks after the victory",
    "Pope Callixtus III ordered the noon bell rung daily to commemorate the victory (still practiced in many churches)",
    "Hungary remained a buffer state between the Ottomans and Western Europe",
  ],
  keyFigures: [
    {
      name: "John Hunyadi",
      role: "Hungarian regent and military commander who led the Christian defense",
    },
    {
      name: "John of Capistrano",
      role: "Franciscan friar who rallied crusader volunteers to the cause",
    },
    {
      name: "Sultan Mehmed II",
      role: "Ottoman Sultan who led the siege",
    },
  ],
  relatedEventIds: ["evt-1453-001"],
  sources: [
    "John Jefferson, 'The Holy Wars of King Wladislas and Sultan Murad' (2012)",
    "Pál Engel, 'The Realm of St Stephen: A History of Medieval Hungary' (2001)",
  ],
};

const EVENT_1456_RETRIAL: HistoricalEvent = {
  id: "evt-1456-002",
  title: "Posthumous Retrial of Joan of Arc",
  year: BigInt(1456),
  exactDate: "July 7, 1456",
  locationName: "Rouen, Kingdom of France",
  latitude: 49.4432,
  longitude: 1.0993,
  region: "Europe",
  civilization: "Kingdom of France",
  category: "culture",
  shortSummary:
    "Pope Callixtus III authorized a retrial that officially overturned the 1431 heresy conviction of Joan of Arc, declaring her innocent and a martyr.",
  fullDescription:
    "Twenty-five years after Joan of Arc was burned at the stake by an English-controlled court in 1431, Pope Callixtus III authorized a nullification trial at the request of Joan's mother, Isabelle Romée, and the French crown. The retrial examined the original proceedings and found them riddled with procedural and theological errors. On July 7, 1456, Joan was officially declared innocent of all charges and rehabilitated as a martyr of the Church. The verdict was politically significant for France, reinforcing the legitimacy of the Valois dynasty whose accession Joan had championed, and it cemented Joan's status as a national hero. She would be canonized as a saint in 1920.",
  causes: [
    "Pressure from Joan's family, particularly her mother Isabelle Romée",
    "Political need of the French crown to legitimize its victory in the Hundred Years' War",
    "Election of Pope Callixtus III who agreed to authorize the proceedings",
    "Widespread belief that the original trial had been politically motivated by the English",
  ],
  consequences: [
    "Joan of Arc officially declared innocent and rehabilitated",
    "Strengthened the legitimacy of the French Valois dynasty",
    "Began the long process of Joan's veneration, leading to canonization in 1920",
    "Set a legal precedent for posthumous review of ecclesiastical trials",
  ],
  keyFigures: [
    {
      name: "Joan of Arc",
      role: "French military leader posthumously exonerated",
    },
    {
      name: "Pope Callixtus III",
      role: "Pope who authorized the nullification trial",
    },
    {
      name: "Isabelle Romée",
      role: "Joan's mother who petitioned for the retrial",
    },
  ],
  relatedEventIds: [],
  sources: [
    "Régine Pernoud, 'The Retrial of Joan of Arc' (1955)",
    "Kelly DeVries, 'Joan of Arc: A Military Leader' (1999)",
  ],
};

const SEED_EVENTS = [
  EVENT_1453_CONSTANTINOPLE,
  EVENT_1453_GUTENBERG,
  EVENT_1456_BELGRADE,
  EVENT_1456_RETRIAL,
];

export function useSeedEvents() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const seeded = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || seeded.current) return;
    seeded.current = true;

    const seed = async () => {
      // Check whether the first seed event already exists in the canister.
      // If not, the canister was restarted and lost its data — re-seed all events.
      let needsSeed = false;
      try {
        const existing = await actor.getEventById(SEED_EVENTS[0].id);
        if (existing === null || existing === undefined) {
          needsSeed = true;
        }
      } catch {
        // Query failed; proceed to attempt seeding anyway
        needsSeed = true;
      }

      if (!needsSeed) return;

      for (const event of SEED_EVENTS) {
        try {
          await actor.addEvent(event);
        } catch {
          // Event already exists — ignore
        }
      }

      // Invalidate timeline queries so they re-fetch fresh data from the canister
      // now that the seed events have been written.
      await queryClient.invalidateQueries({ queryKey: ["allYears"] });
      await queryClient.invalidateQueries({ queryKey: ["eventsByYear"] });
      await queryClient.refetchQueries({ queryKey: ["allYears"] });
    };

    seed();
  }, [actor, isFetching, queryClient]);
}
