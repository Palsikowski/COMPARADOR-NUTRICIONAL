// GERADO A PARTIR DE PLANILHA INTERNA DA AGROCETE — não editar à mão.
// Fonte: COMPARATIVO_PORTFOLIO_MERCADO_AGROCETE.xlsx, aba "P. Similares".
// Para cada categoria/composição, lista o produto Agrocete e o equivalente de
// cada marca concorrente (quando existe). productId aponta para PRODUCTS —
// hoje todo produto da matriz tem um productId (mesmo os que não têm dados
// nutricionais cadastrados ainda, com hasNutrients: false em products.js) —
// exceto quando o nome do concorrente é genérico/não identificado.

export const EQUIVALENCE_FOOTNOTES = [
  "As comparações dos produtos são de similaridades com a composição dos nutrientes presentes, não necessariamente os produtos comparados possuem a mesma concentração",
  "* Os produtos com um asterisco se referem a produtos com composição dos nutrientes similares, porém não possuem bioestimulante",
  "** Os produtos com 2 asteriscos se referem a produtos com bioestimulante similar, porem sem nutrientes",
  "A comparação dos produtos de biocontrole se referem apenas ao alvo de registro, não ao microorganismo da formulação (podendo ser bactérias ou fungos)"
];

export const EQUIVALENCES = [
  {
    "category": "INOCULANTE",
    "composition": "Solubilizador",
    "agroceteName": "GRAP NOD PHOS",
    "agroceteProductId": "agrocete__grap-nodphos",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "SolubPhos",
        "productId": "simbiose__solubphos"
      },
      {
        "brand": "BIOMA",
        "name": "BiomaPhos",
        "productId": "bioma__biomaphos"
      },
      {
        "brand": "ICL",
        "name": "ActibioX Phos",
        "productId": "icl__actibio-x-phos"
      },
      {
        "brand": "BALLAGRO",
        "name": "Hober Phos",
        "productId": "ballagro__hober-phos"
      },
      {
        "brand": "GENICA",
        "name": "Inceptor",
        "productId": "genica__inceptor"
      },
      {
        "brand": "BIOTROP",
        "name": "Biofree",
        "productId": "biotrop__biofree"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Phos",
        "productId": "dimicron__dimi-phos"
      }
    ]
  },
  {
    "category": "INOCULANTE",
    "composition": "Bradyrhizobium turfa",
    "agroceteName": "GRAP NOD +",
    "agroceteProductId": null,
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "SimbioseNod Soja T",
        "productId": "simbiose__simbiosenod-soja-t"
      },
      {
        "brand": "ICL",
        "name": "ActibioX Brady T",
        "productId": "icl__actibiox-brady-t"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Quest XtraNod Turfa",
        "productId": "f1rst-agbiotech__questxtranod-turfa"
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Premium T Soja",
        "productId": "vittia__biomax-premium-t-soja"
      },
      {
        "brand": "BALLAGRO",
        "name": "Hober Soy Turfoso",
        "productId": "ballagro__hober-soy-turfoso"
      },
      {
        "brand": "GENICA",
        "name": "Fixaron Brady-T",
        "productId": "genica__fixaron-brady-t"
      },
      {
        "brand": "KOPPERT",
        "name": "Rizokop Turfa",
        "productId": "koppert__rizokop-turfa"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Brad T",
        "productId": "dimicron__dimi-brad-t"
      }
    ]
  },
  {
    "category": "INOCULANTE",
    "composition": "Azospirillum turfa",
    "agroceteName": "GRAP NOD A",
    "agroceteProductId": null,
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "SimbioseMaíz T",
        "productId": "simbiose__simbiosemaiz-t"
      },
      {
        "brand": "ICL",
        "name": "ActibioX Azos T",
        "productId": "icl__actibiox-azos-t"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Azos T",
        "productId": "dimicron__dimi-azos-t"
      }
    ]
  },
  {
    "category": "INOCULANTE",
    "composition": "Azospirillum liquido",
    "agroceteName": "GRAP NOD AL",
    "agroceteProductId": null,
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "SimbioseMaíz L",
        "productId": "simbiose__simbiosemaiz-l"
      },
      {
        "brand": "BIOMA",
        "name": "BiomaMais",
        "productId": "bioma__bioma-mais"
      },
      {
        "brand": "ICL",
        "name": "ActibioX Azos",
        "productId": "icl__actibio-x-azos"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Quest DuoN",
        "productId": "f1rst-agbiotech__questduon"
      },
      {
        "brand": "NITRO",
        "name": "Rizoplant Azos",
        "productId": "nitro__rizoplant-azos"
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Azum",
        "productId": "vittia__biomax-azum"
      },
      {
        "brand": "BALLAGRO",
        "name": "Hober Azos",
        "productId": "ballagro__hober-azos"
      },
      {
        "brand": "LALLEMAND",
        "name": "Lalrise Azos SC",
        "productId": "lallemand__lalrise-azos-sc"
      },
      {
        "brand": "GENICA",
        "name": "Fixaron Azos",
        "productId": "genica__fixaron-azos"
      },
      {
        "brand": "BIOTROP",
        "name": "AzoTrop",
        "productId": "biotrop__azotrop"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Welt",
        "productId": "agrivalle__welt"
      },
      {
        "brand": "KOPPERT",
        "name": "Azokop",
        "productId": "koppert__azokop"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Azoflex",
        "productId": "giro-agro-viva-bio__azoflex"
      },
      {
        "brand": "GRAN7",
        "name": "Verdesian Accolade",
        "productId": "gran7__verdesian-accolade"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Azos",
        "productId": "dimicron__dimi-azos"
      }
    ]
  },
  {
    "category": "INOCULANTE",
    "composition": "Bradyrhizobium liquido",
    "agroceteName": "GRAP NOD L +",
    "agroceteProductId": "agrocete__grap-nod-l",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "SimbioseNod Soja",
        "productId": "simbiose__simbiose-nod-soja"
      },
      {
        "brand": "BIOMA",
        "name": "BiomaBrady",
        "productId": "bioma__bioma-brady"
      },
      {
        "brand": "ICL",
        "name": "ActibioX Brady",
        "productId": "icl__actibio-x-brady"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Quest XtraNod",
        "productId": "f1rst-agbiotech__questxtranod"
      },
      {
        "brand": "NITRO",
        "name": "Rizoplant L",
        "productId": "nitro__rizoplant-l"
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Premium L Soja",
        "productId": "vittia__biomax-premium-l-soja"
      },
      {
        "brand": "BALLAGRO",
        "name": "Hober Soy",
        "productId": "ballagro__hober-soy"
      },
      {
        "brand": "LALLEMAND",
        "name": "Starfix Soja",
        "productId": "lallemand__starfix-soja"
      },
      {
        "brand": "GENICA",
        "name": "Fixaron Brady-L",
        "productId": "genica__fixaron-brady-l"
      },
      {
        "brand": "BIOTROP",
        "name": "RhizoTrop",
        "productId": "biotrop__rhizotrop"
      },
      {
        "brand": "AGRIVALLE",
        "name": "N-haus",
        "productId": "agrivalle__n-haus"
      },
      {
        "brand": "KOPPERT",
        "name": "Rizokop",
        "productId": "koppert__rizokop"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "NitroSoy",
        "productId": "giro-agro-viva-bio__nitrosoy"
      },
      {
        "brand": "GRAN7",
        "name": "Verdesian Primo",
        "productId": "gran7__verdesian-primo"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Brady",
        "productId": "dimicron__dimi-brady"
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Rizoliq LLI",
        "productId": "syngenta-biologicals__rizoliq-lli"
      }
    ]
  },
  {
    "category": "INOCULANTE",
    "composition": "Rhizobium feijão",
    "agroceteName": "GRAP NOD Fl",
    "agroceteProductId": null,
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "SimbioseNod Feijão",
        "productId": "simbiose__simbiose-nod-feijao"
      },
      {
        "brand": "BIOMA",
        "name": "Bioma Rhizo",
        "productId": "bioma__bioma-rhizo"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Quest Rizos",
        "productId": "f1rst-agbiotech__questrizos"
      },
      {
        "brand": "NITRO",
        "name": "Rizoplant F",
        "productId": "nitro__rizoplant-f"
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Premium L Feijão",
        "productId": "vittia__biomax-premium-l-feijao"
      }
    ]
  },
  {
    "category": "INOCULANTE",
    "composition": "Polímeros proteção",
    "agroceteName": "GRAP EXTRA NOD",
    "agroceteProductId": "agrocete__grap-extranod",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "Simbiose Pro",
        "productId": "simbiose__simbiose-pro"
      },
      {
        "brand": "BIOMA",
        "name": "Bioma Fix",
        "productId": "bioma__bioma-fix"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Fator Nod",
        "productId": "f1rst-agbiotech__fatornod"
      },
      {
        "brand": "VITTIA",
        "name": "Max Protection",
        "productId": "vittia__max-protection"
      },
      {
        "brand": "LALLEMAND",
        "name": "Bioprotector",
        "productId": "lallemand__bioprotector"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Kapsel",
        "productId": "agrivalle__kapsel"
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Premax LLI",
        "productId": "syngenta-biologicals__premax-lli"
      }
    ]
  },
  {
    "category": "TEC. APLIC.",
    "composition": "Adjuvante D-limoneno",
    "agroceteName": "GRAP D-LIM",
    "agroceteProductId": "agrocete__grap-d-lim",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "StimuSpray O",
        "productId": "simbiose__stimuspray-o"
      },
      {
        "brand": "UNION AGRO",
        "name": "Bravium",
        "productId": "union-agro__bravium"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "EcoImpact",
        "productId": "f1rst-agbiotech__ecoimpact"
      },
      {
        "brand": "NITRO",
        "name": "Contact Wsp",
        "productId": "nitro__contact-wsp"
      },
      {
        "brand": "VITTIA",
        "name": "Aurantia",
        "productId": "vittia__aurantia"
      },
      {
        "brand": "BIOTROP",
        "name": "BioCalda",
        "productId": "biotrop__biocalda"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Acti Oil",
        "productId": "giro-agro-viva-bio__acti-oil"
      },
      {
        "brand": "GRAN7",
        "name": "Citrus Prime",
        "productId": "gran7__citrus-prime"
      }
    ]
  },
  {
    "category": "TEC. APLIC.",
    "composition": "Adjuvante utilitário",
    "agroceteName": "GRAP SUPER GUN SR",
    "agroceteProductId": "agrocete__grap-super-gun-sr",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "StimuSpray F",
        "productId": "simbiose__stimuspray-f"
      },
      {
        "brand": "ICL",
        "name": "Helper Neutrum",
        "productId": "icl__helper-neutrum"
      },
      {
        "brand": "UNION AGRO",
        "name": "Nexus",
        "productId": "union-agro__nexus"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "LI700 / Top Zero",
        "productId": "fortgreen-f1rst-agbiotech__li700-top-zero"
      },
      {
        "brand": "NITRO",
        "name": "Dropon",
        "productId": "nitro__dropon"
      },
      {
        "brand": "UBYFOL",
        "name": "Satus / Disperse Ultra",
        "productId": "ubyfol__satus-disperse-ultra"
      },
      {
        "brand": "VITTIA",
        "name": "Silkon",
        "productId": "vittia__silkon"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Rubber",
        "productId": "ballagro__pick-up-rubber"
      },
      {
        "brand": "GENICA",
        "name": "Vycit Neutro",
        "productId": "genica__vycit-neutro"
      },
      {
        "brand": "AGRIVALLE",
        "name": "HiperFixx",
        "productId": "agrivalle__hiperfixx"
      },
      {
        "brand": "KOPPERT",
        "name": "Ranchero",
        "productId": "koppert__ranchero"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Acquamax",
        "productId": "giro-agro-viva-bio__acquamax"
      },
      {
        "brand": "GRAN7",
        "name": "Brenn Oil",
        "productId": "gran7__brenn-oil"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi A20+",
        "productId": "dimicron__dimi-a20-mais"
      }
    ]
  },
  {
    "category": "TEC. APLIC.",
    "composition": "Adjuvante utilitário reduz pH",
    "agroceteName": "GRAP SUPER GUN",
    "agroceteProductId": "agrocete__grap-super-gun",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "StimuSpray D",
        "productId": "simbiose__stimuspray-d"
      },
      {
        "brand": "ICL",
        "name": "Helper Dessek",
        "productId": "icl__helper-dessek"
      },
      {
        "brand": "UNION AGRO",
        "name": "Triomax",
        "productId": "union-agro__triomax"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "MIG / Rsolve Duo",
        "productId": "fortgreen-f1rst-agbiotech__mig-rsolve-duo"
      },
      {
        "brand": "NITRO",
        "name": "New Reduce",
        "productId": "nitro__new-reduce"
      },
      {
        "brand": "VITTIA",
        "name": "Poliflex",
        "productId": "vittia__poliflex"
      },
      {
        "brand": "GENICA",
        "name": "Vycit Redutor",
        "productId": "genica__vycit-redutor"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Acquamax Power+",
        "productId": "giro-agro-viva-bio__acquamax-power-mais"
      },
      {
        "brand": "GRAN7",
        "name": "Orama",
        "productId": "gran7__orama"
      }
    ]
  },
  {
    "category": "TEC. APLIC.",
    "composition": "Limpeza tanque",
    "agroceteName": "ALPHA TANK",
    "agroceteProductId": null,
    "competitors": [
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Invictus",
        "productId": "fortgreen-f1rst-agbiotech__invictus"
      },
      {
        "brand": "VITTIA",
        "name": "Super Clean",
        "productId": "vittia__super-clean"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Clean",
        "productId": "giro-agro-viva-bio__clean"
      },
      {
        "brand": "GRAN7",
        "name": "Dinamus",
        "productId": "gran7__dinamus"
      }
    ]
  },
  {
    "category": "TEC. APLIC.",
    "composition": "Condicionador de calda",
    "agroceteName": "GRAP SENSOR",
    "agroceteProductId": "agrocete__grap-sensor",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "Agris",
        "productId": "union-agro__agris"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Rsolve",
        "productId": "fortgreen-f1rst-agbiotech__rsolve"
      },
      {
        "brand": "VITTIA",
        "name": "Combine Max",
        "productId": "vittia__combine-max"
      }
    ]
  },
  {
    "category": "TEC. APLIC.",
    "composition": "Oleo vegetal",
    "agroceteName": "GRAP OIL",
    "agroceteProductId": "agrocete__grap-oil",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "MSO",
        "productId": "union-agro__mso"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Magic-Oil",
        "productId": "fortgreen-f1rst-agbiotech__magic-oil"
      },
      {
        "brand": "VITTIA",
        "name": "Du Fol",
        "productId": "vittia__du-fol"
      },
      {
        "brand": "GRAN7",
        "name": "Emulsoy",
        "productId": "gran7__emulsoy"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Desalojante / Enxofre",
    "agroceteName": "GRAP EVIC-S",
    "agroceteProductId": "agrocete__grap-evic-s",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "S Gold",
        "productId": "union-agro__s-gold"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Sulper",
        "productId": "fortgreen-f1rst-agbiotech__sulper"
      },
      {
        "brand": "VITTIA",
        "name": "Thiomax",
        "productId": "vittia__thiomax"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Essence",
        "productId": "giro-agro-viva-bio__essence"
      },
      {
        "brand": "GRAN7",
        "name": "Expell",
        "productId": "gran7__expell"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Enraizante + Bioestimulante",
    "agroceteName": "GRAP ST PRO",
    "agroceteProductId": "agrocete__grap-st-pro",
    "competitors": [
      {
        "brand": "ICL",
        "name": "Up Seeds",
        "productId": "icl__up-seeds"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Awaken / Germinate",
        "productId": "fortgreen-f1rst-agbiotech__awaken-germinate"
      },
      {
        "brand": "NITRO",
        "name": "Support",
        "productId": "nitro__support"
      },
      {
        "brand": "VITTIA",
        "name": "BioEnergy *",
        "productId": "vittia__bioenergy"
      },
      {
        "brand": "AGRIVALLE",
        "name": "CoMoNi / Raizer",
        "productId": "agrivalle__comoni-raizer"
      },
      {
        "brand": "KOPPERT",
        "name": "Acadian **",
        "productId": "koppert__acadian"
      },
      {
        "brand": "GRAN7",
        "name": "Max Raiz",
        "productId": "gran7__max-raiz"
      },
      {
        "brand": "DIMICRON",
        "name": "TMSP Power",
        "productId": "dimicron__tmsp-power"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "B  + Bioestimulante",
    "agroceteName": "GRAP BREED PRO",
    "agroceteProductId": "agrocete__grap-breed-pro",
    "competitors": [
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Mobile",
        "productId": "fortgreen-f1rst-agbiotech__mobile"
      },
      {
        "brand": "BIOTROP",
        "name": "BioNautus **",
        "productId": "biotrop__bionautus"
      },
      {
        "brand": "KOPPERT",
        "name": "Roadster **",
        "productId": "koppert__roadster"
      },
      {
        "brand": "GRAN7",
        "name": "Domain Complex",
        "productId": "gran7__domain-complex"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "CoMo + Bioestimulante",
    "agroceteName": "GRAP FIELD PRO",
    "agroceteProductId": "agrocete__grap-field-pro",
    "competitors": [
      {
        "brand": "VITTIA",
        "name": "BioPower",
        "productId": "vittia__bio-power"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Arrel",
        "productId": "ballagro__pick-up-arrel"
      },
      {
        "brand": "KOPPERT",
        "name": "Stingray **",
        "productId": "koppert__stingray"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Macro e micro + Bioestimulante",
    "agroceteName": "GRAP ORGANO TOP",
    "agroceteProductId": "agrocete__grap-organo-top",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "StimuFull *",
        "productId": "simbiose__stimufull"
      },
      {
        "brand": "BIOMA",
        "name": "BioAtivo *",
        "productId": "bioma__bio-ativo"
      },
      {
        "brand": "ICL",
        "name": "Concorde",
        "productId": "icl__concorde"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "BlackGold",
        "productId": "fortgreen-f1rst-agbiotech__blackgold"
      },
      {
        "brand": "NITRO",
        "name": "Sustent *",
        "productId": "nitro__sustent"
      },
      {
        "brand": "UBYFOL",
        "name": "Kymon",
        "productId": "ubyfol__kymon"
      },
      {
        "brand": "VITTIA",
        "name": "Fertium",
        "productId": "vittia__fertium"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Sten",
        "productId": "ballagro__pick-up-sten"
      },
      {
        "brand": "GENICA",
        "name": "Volt",
        "productId": "genica__volt"
      },
      {
        "brand": "AGRIVALLE",
        "name": "MixFull *",
        "productId": "agrivalle__mixfull"
      },
      {
        "brand": "GRAN7",
        "name": "Orggam / Ferggum",
        "productId": "gran7__orggam-ferggum"
      },
      {
        "brand": "DIMICRON",
        "name": "DimiLom",
        "productId": "dimicron__dimilom"
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Megafol",
        "productId": "syngenta-biologicals__megafol"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Micro + Aminoácidos",
    "agroceteName": "GRAP AMYNO 15",
    "agroceteProductId": "agrocete__grap-amyno-15",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "Nutry Amino",
        "productId": "union-agro__nutry-amino"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Physio Crop Full",
        "productId": "fortgreen-f1rst-agbiotech__physio-crop-full"
      },
      {
        "brand": "NITRO",
        "name": "Revita",
        "productId": "nitro__revita"
      },
      {
        "brand": "UBYFOL",
        "name": "Ubyverde",
        "productId": "ubyfol__ubyverde"
      },
      {
        "brand": "VITTIA",
        "name": "Bioamino Premium",
        "productId": "vittia__bioamino-premium"
      },
      {
        "brand": "LALLEMAND",
        "name": "Lalstim Nutri",
        "productId": "lallemand__lalstim-nutri"
      },
      {
        "brand": "GENICA",
        "name": "No-Dry",
        "productId": "genica__no-dry"
      },
      {
        "brand": "BIOTROP",
        "name": "BioAtivus",
        "productId": "biotrop__bioativus"
      },
      {
        "brand": "AGRIVALLE",
        "name": "GramTop",
        "productId": "agrivalle__gramtop"
      },
      {
        "brand": "GRAN7",
        "name": "Microsix Complex",
        "productId": "gran7__microsix-complex"
      },
      {
        "brand": "DIMICRON",
        "name": "DimiTônico Full",
        "productId": "dimicron__dimitonico-full"
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Yield On",
        "productId": "syngenta-biologicals__yield-on"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Fosfito de Cu",
    "agroceteName": "GRAP PHIL COBRE",
    "agroceteProductId": "agrocete__grap-phil-cobre",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "Fosfito 20",
        "productId": "union-agro__fosfito-20"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Curative",
        "productId": "fortgreen-f1rst-agbiotech__curative"
      },
      {
        "brand": "UBYFOL",
        "name": "Aminofosfito de Cobre",
        "productId": "ubyfol__aminofosfito-de-cobre"
      },
      {
        "brand": "VITTIA",
        "name": "Phitopress Cobre",
        "productId": "vittia__phitopress-cobre"
      },
      {
        "brand": "BALLAGRO",
        "name": "Prosit",
        "productId": "ballagro__prosit"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Strong",
        "productId": "giro-agro-viva-bio__strong"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Cobre",
        "productId": "dimicron__dimi-cobre"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Nitrogênio",
    "agroceteName": "GRAP NITRO",
    "agroceteProductId": "agrocete__grap-nitro",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "N30",
        "productId": "union-agro__n30"
      },
      {
        "brand": "NITRO",
        "name": "Grow N",
        "productId": "nitro__grow-n"
      },
      {
        "brand": "UBYFOL",
        "name": "N32",
        "productId": "ubyfol__n32"
      },
      {
        "brand": "BALLAGRO",
        "name": "Nitromais",
        "productId": "ballagro__nitromais"
      },
      {
        "brand": "AGRIVALLE",
        "name": "N30",
        "productId": "agrivalle__n30"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "New",
        "productId": "giro-agro-viva-bio__new"
      },
      {
        "brand": "DIMICRON",
        "name": "N42",
        "productId": "dimicron__n42"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Manganês p/ Glifosato",
    "agroceteName": "GRAP MANGANÊS RR PLUS",
    "agroceteProductId": "agrocete__grap-manganes-rr-plus",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "MnR7",
        "productId": "union-agro__mnr7"
      },
      {
        "brand": "NITRO",
        "name": "Compat Complex",
        "productId": "nitro__compat-complex"
      },
      {
        "brand": "UBYFOL",
        "name": "Mn130RR",
        "productId": "ubyfol__mn130rr"
      },
      {
        "brand": "VITTIA",
        "name": "Mangan 10",
        "productId": "vittia__mangan-10"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Plexxus Mn",
        "productId": "agrivalle__plexxus-mn"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Time RR / Top Mn",
        "productId": "giro-agro-viva-bio__time-rr-top-mn"
      },
      {
        "brand": "GRAN7",
        "name": "Polyamine Mn Complex",
        "productId": "gran7__polyamine-mn-complex"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Magnésio",
    "agroceteName": "GRAP MAGNÉSIO",
    "agroceteProductId": "agrocete__grap-magnesio",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "Mg 8",
        "productId": "union-agro__mg-8"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "MagGreen",
        "productId": "fortgreen-f1rst-agbiotech__maggreen"
      },
      {
        "brand": "UBYFOL",
        "name": "Mag-8",
        "productId": "ubyfol__mag8"
      },
      {
        "brand": "VITTIA",
        "name": "Magnésio Max",
        "productId": "vittia__magnesio-max"
      },
      {
        "brand": "BALLAGRO",
        "name": "Nutri Pro Magnésio",
        "productId": "ballagro__nutri-pro-magnesio"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Algon",
        "productId": "agrivalle__algon"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Evo Mag",
        "productId": "giro-agro-viva-bio__evo-mag"
      },
      {
        "brand": "GRAN7",
        "name": "MG 8,5",
        "productId": "gran7__mg-8-5"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Mg + Bioestimulante",
    "agroceteName": "GRAP GRAD",
    "agroceteProductId": "agrocete__grap-grad",
    "competitors": [
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Exodus",
        "productId": "fortgreen-f1rst-agbiotech__exodus"
      },
      {
        "brand": "GRAN7",
        "name": "Set-in",
        "productId": "gran7__set-in"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Boro",
    "agroceteName": "GRAP BORIC",
    "agroceteProductId": "agrocete__grap-boric",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "Boro L",
        "productId": "union-agro__boro-l"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Boro 10",
        "productId": "fortgreen-f1rst-agbiotech__boro-10"
      },
      {
        "brand": "NITRO",
        "name": "BorOn",
        "productId": "nitro__boron"
      },
      {
        "brand": "UBYFOL",
        "name": "MS-Boro",
        "productId": "ubyfol__ms-boro"
      },
      {
        "brand": "VITTIA",
        "name": "Boro",
        "productId": "vittia__boro"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Boro",
        "productId": "ballagro__pick-up-boro"
      },
      {
        "brand": "AGRIVALLE",
        "name": "BoroPlex",
        "productId": "agrivalle__boroplex"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Bor Folha",
        "productId": "giro-agro-viva-bio__bor-folha"
      },
      {
        "brand": "GRAN7",
        "name": "Boro 10",
        "productId": "gran7__boro-10"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Manganês Quelato",
    "agroceteName": "GRAP 140 FLUID",
    "agroceteProductId": "agrocete__grap-140-fluid",
    "competitors": [
      {
        "brand": "ICL",
        "name": "Kellus Manganes (Sais)",
        "productId": "icl__kellus-manganes-sais"
      },
      {
        "brand": "UNION AGRO",
        "name": "Nutry Mn 10",
        "productId": "union-agro__nutry-mn-10"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "MnEDTA",
        "productId": "fortgreen-f1rst-agbiotech__mnedta"
      },
      {
        "brand": "VITTIA",
        "name": "Express",
        "productId": "vittia__express"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Mn EDTA",
        "productId": "ballagro__pick-up-mn-edta"
      },
      {
        "brand": "AGRIVALLE",
        "name": "EfetiveR",
        "productId": "agrivalle__efetiver"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Foto Gen",
        "productId": "giro-agro-viva-bio__foto-gen"
      },
      {
        "brand": "DIMICRON",
        "name": "DimiManganes",
        "productId": "dimicron__dimimanganes"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Zinco",
    "agroceteName": "GRAP 104 FLUID",
    "agroceteProductId": "agrocete__grap-104-fluid",
    "competitors": [
      {
        "brand": "ICL",
        "name": "Kellus  Zinco (Sais)",
        "productId": "icl__kellus-zinco-sais"
      },
      {
        "brand": "UNION AGRO",
        "name": "Zinco S",
        "productId": "union-agro__zinco-s"
      },
      {
        "brand": "VITTIA",
        "name": "Zinco",
        "productId": "vittia__zinco"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Zinco15",
        "productId": "agrivalle__zinco15"
      },
      {
        "brand": "GRAN7",
        "name": "Zinco 10",
        "productId": "gran7__zinco-10"
      },
      {
        "brand": "DIMICRON",
        "name": "DimiZinco",
        "productId": "dimicron__dimizinco"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "CoMo",
    "agroceteName": "GRAP 165 JE",
    "agroceteProductId": "agrocete__grap-165-je",
    "competitors": [
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "CoMo15",
        "productId": "fortgreen-f1rst-agbiotech__como15"
      },
      {
        "brand": "NITRO",
        "name": "Nitro 22",
        "productId": "nitro__nitro-22"
      },
      {
        "brand": "UBYFOL",
        "name": "CoMo ML14",
        "productId": "ubyfol__ml-14"
      },
      {
        "brand": "VITTIA",
        "name": "Nodulus Premium",
        "productId": "vittia__nodulus-premium"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Molibdênio 14",
        "productId": "agrivalle__molibdenio-14"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Evo MoP",
        "productId": "giro-agro-viva-bio__evo-mop"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "CoMo",
    "agroceteName": "GRAP 110 JE",
    "agroceteProductId": "agrocete__grap-110-je",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "StimuLeg 10",
        "productId": "simbiose__stimu-leg-10"
      },
      {
        "brand": "BIOMA",
        "name": "Bio10",
        "productId": "bioma__bio-10"
      },
      {
        "brand": "UNION AGRO",
        "name": "Soja CoMo",
        "productId": "union-agro__soja-como"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "CoMo10",
        "productId": "fortgreen-f1rst-agbiotech__como10"
      },
      {
        "brand": "NITRO",
        "name": "Nitro Ni",
        "productId": "nitro__nitro-ni"
      },
      {
        "brand": "VITTIA",
        "name": "Nodulus Gold",
        "productId": "vittia__nodulus-gold"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "TSN CoMo",
        "productId": "giro-agro-viva-bio__tsn-como"
      },
      {
        "brand": "GRAN7",
        "name": "Mo10%Co1%",
        "productId": "gran7__mo10-co1"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Potássio",
    "agroceteName": "GRAP 30K",
    "agroceteProductId": "agrocete__grap-30k",
    "competitors": [
      {
        "brand": "UBYFOL",
        "name": "K-50",
        "productId": "ubyfol__k-50"
      },
      {
        "brand": "VITTIA",
        "name": "Mega K Full",
        "productId": "vittia__mega-k-full"
      },
      {
        "brand": "BALLAGRO",
        "name": "Nutri Pro Potássio",
        "productId": "ballagro__nutri-pro-potassio"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Evo K",
        "productId": "giro-agro-viva-bio__evo-k"
      },
      {
        "brand": "GRAN7",
        "name": "Gran Finnale",
        "productId": "gran7__gran-finnale"
      },
      {
        "brand": "DIMICRON",
        "name": "K- 400 Full",
        "productId": "dimicron__k-400-full"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Fósforo",
    "agroceteName": "GRAP P306",
    "agroceteProductId": "agrocete__grap-p-306",
    "competitors": [
      {
        "brand": "UNION AGRO",
        "name": "P51",
        "productId": "union-agro__p51"
      },
      {
        "brand": "UBYFOL",
        "name": "P-50",
        "productId": "ubyfol__p-50"
      },
      {
        "brand": "VITTIA",
        "name": "P30",
        "productId": "vittia__p30"
      },
      {
        "brand": "BALLAGRO",
        "name": "Rubber",
        "productId": "ballagro__rubber"
      },
      {
        "brand": "AGRIVALLE",
        "name": "P52",
        "productId": "agrivalle__p52"
      },
      {
        "brand": "DIMICRON",
        "name": "Drop",
        "productId": "dimicron__drop"
      }
    ]
  },
  {
    "category": "NUTRIÇÃO E FISIOLOGIA",
    "composition": "Micronutrientes",
    "agroceteName": "GRAP MONT15",
    "agroceteProductId": "agrocete__grap-mont-15",
    "competitors": [
      {
        "brand": "ICL",
        "name": "Profol Produtividade (Sais)",
        "productId": "icl__profol-produtividade-sais"
      },
      {
        "brand": "UNION AGRO",
        "name": "Nutry Virtus",
        "productId": "union-agro__nutry-virtus"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Soja Plus Gold",
        "productId": "fortgreen-f1rst-agbiotech__soja-plus-gold"
      },
      {
        "brand": "NITRO",
        "name": "Force Mn",
        "productId": "nitro__force-mn"
      },
      {
        "brand": "VITTIA",
        "name": "Métis Nutri",
        "productId": "vittia__metis-nutri"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Win EDTA",
        "productId": "ballagro__pick-up-win-edta"
      },
      {
        "brand": "GENICA",
        "name": "Vigorus",
        "productId": "genica__vigorus"
      },
      {
        "brand": "AGRIVALLE",
        "name": "SoySixx",
        "productId": "agrivalle__soysixx"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Complex Mais",
        "productId": "giro-agro-viva-bio__complex-mais"
      },
      {
        "brand": "GRAN7",
        "name": "Brave Max",
        "productId": "gran7__brave-max"
      }
    ]
  },
  {
    "category": "BIOCONTROLE",
    "composition": "Bioinseticida p/ lagarta",
    "agroceteName": "GRAP BEESECT",
    "agroceteProductId": null,
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "BTControl",
        "productId": "simbiose__bt-control"
      },
      {
        "brand": "BIOMA",
        "name": "BTProtection",
        "productId": "bioma__bt-protection"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Quest BT",
        "productId": "f1rst-agbiotech__questbt"
      },
      {
        "brand": "VITTIA",
        "name": "BT Turbo Max",
        "productId": "vittia__bt-turbo-max"
      },
      {
        "brand": "BALLAGRO",
        "name": "Acera / Helymax EC",
        "productId": "ballagro__acera-helymax-ec"
      },
      {
        "brand": "LALLEMAND",
        "name": "Crystal",
        "productId": "lallemand__crystal"
      },
      {
        "brand": "GENICA",
        "name": "Tarik EC",
        "productId": "genica__tarik-ec"
      },
      {
        "brand": "BIOTROP",
        "name": "BioBrev  Full",
        "productId": "biotrop__biobrev-full"
      }
    ]
  },
  {
    "category": "BIOCONTROLE",
    "composition": "Biofungicida",
    "agroceteName": "GRAP BEESTRIC",
    "agroceteProductId": "agrocete__grap-beestric",
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "Stimu / GreenControl",
        "productId": "simbiose__stimu-greencontrol"
      },
      {
        "brand": "BIOMA",
        "name": "TrichProtection",
        "productId": "bioma__trichprotection"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Tanus",
        "productId": "f1rst-agbiotech__tanus"
      },
      {
        "brand": "NITRO",
        "name": "Trichodermaiz WP Pro",
        "productId": "nitro__trichodermaiz-wp-pro"
      },
      {
        "brand": "VITTIA",
        "name": "Tricho-turbo",
        "productId": "vittia__tricho-turbo"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pardella / Ecotrich",
        "productId": "ballagro__pardella-ecotrich"
      },
      {
        "brand": "LALLEMAND",
        "name": "Quality WG",
        "productId": "lallemand__quality-wg"
      },
      {
        "brand": "GENICA",
        "name": "Congregga",
        "productId": "genica__congregga"
      },
      {
        "brand": "BIOTROP",
        "name": "NatuControl / Bombardeiro",
        "productId": "biotrop__natucontrol-bombardeiro"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Shocker",
        "productId": "agrivalle__shocker"
      },
      {
        "brand": "KOPPERT",
        "name": "Trichodermil / Trianum",
        "productId": "koppert__trichodermil-trianum"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Tricho Combat Pro",
        "productId": "giro-agro-viva-bio__tricho-combat-pro"
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Arvatico",
        "productId": "syngenta-biologicals__arvatico"
      }
    ]
  },
  {
    "category": "BIOCONTROLE",
    "composition": "Bionematicida",
    "agroceteName": "BIOSTAT",
    "agroceteProductId": null,
    "competitors": [
      {
        "brand": "SIMBIOSE",
        "name": "NemaControl",
        "productId": "simbiose__nema-control"
      },
      {
        "brand": "BIOMA",
        "name": "NemaProtection",
        "productId": "bioma__nema-protection"
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Royal Prezor",
        "productId": "f1rst-agbiotech__royalprezor"
      },
      {
        "brand": "NITRO",
        "name": "Ceres / Dunna / Elmo",
        "productId": "nitro__ceres-dunna-elmo"
      },
      {
        "brand": "VITTIA",
        "name": "No-nema",
        "productId": "vittia__no-nema"
      },
      {
        "brand": "BALLAGRO",
        "name": "Nemat",
        "productId": "ballagro__nemat"
      },
      {
        "brand": "LALLEMAND",
        "name": "Rizos OG",
        "productId": "lallemand__rizos-og"
      },
      {
        "brand": "GENICA",
        "name": "Dulia / Paladyo",
        "productId": "genica__dulia-paladyo"
      },
      {
        "brand": "BIOTROP",
        "name": "Biomagno / Furatrop",
        "productId": "biotrop__biomagno-furatrop"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Profix",
        "productId": "agrivalle__profix"
      },
      {
        "brand": "KOPPERT",
        "name": "Veraneio / Boneville / Chevelle",
        "productId": "koppert__veraneio-boneville-chevelle"
      },
      {
        "brand": "GRAN7",
        "name": "Vigga / Nematak",
        "productId": "gran7__vigga-nematak"
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Arvatico",
        "productId": "syngenta-biologicals__arvatico"
      }
    ]
  }
];
