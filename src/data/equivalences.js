// GERADO A PARTIR DE PLANILHA INTERNA DA AGROCETE — não editar à mão.
// Fonte: COMPARATIVO_PORTFOLIO_MERCADO_AGROCETE.xlsx, aba "P. Similares".
// Para cada categoria/composição, lista o produto Agrocete e o equivalente de
// cada marca concorrente (quando existe). productId aponta para PRODUCTS quando
// foi possível casar o nome com um produto cadastrado em products.js — quando
// null, o nome do produto concorrente é exibido só como referência textual
// (não há dados nutricionais cadastrados para ele nas planilhas fornecidas).

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
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Inceptor",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "Biofree",
        "productId": "biotrop__biofree"
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Phos",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "ICL",
        "name": "ActibioX Brady T",
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Quest XtraNod Turfa",
        "productId": "f1rst-agbiotech__questxtranod-turfa"
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Premium T Soja",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Hober Soy Turfoso",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Fixaron Brady-T",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Rizokop Turfa",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Brad T",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "ICL",
        "name": "ActibioX Azos T",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Azos T",
        "productId": null
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
        "productId": null
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
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Azum",
        "productId": "vittia__biomax-azum"
      },
      {
        "brand": "BALLAGRO",
        "name": "Hober Azos",
        "productId": null
      },
      {
        "brand": "LALLEMAND",
        "name": "Lalrise Azos SC",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Fixaron Azos",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "AzoTrop",
        "productId": "biotrop__azotrop"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Welt",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Azokop",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Azoflex",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Verdesian Accolade",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Azos",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Premium L Soja",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Hober Soy",
        "productId": null
      },
      {
        "brand": "LALLEMAND",
        "name": "Starfix Soja",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Fixaron Brady-L",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "RhizoTrop",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "N-haus",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Rizokop",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "NitroSoy",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Verdesian Primo",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Brady",
        "productId": null
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Rizoliq LLI",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Quest Rizos",
        "productId": "f1rst-agbiotech__questrizos"
      },
      {
        "brand": "NITRO",
        "name": "Rizoplant F",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Biomax Premium L Feijão",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "Kapsel",
        "productId": null
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Premax LLI",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "UNION AGRO",
        "name": "Bravium",
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "EcoImpact",
        "productId": "f1rst-agbiotech__ecoimpact"
      },
      {
        "brand": "NITRO",
        "name": "Contact Wsp",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Aurantia",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "BioCalda",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Acti Oil",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Citrus Prime",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "ICL",
        "name": "Helper Neutrum",
        "productId": "icl__helper-neutrum"
      },
      {
        "brand": "UNION AGRO",
        "name": "Nexus",
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "LI700 / Top Zero",
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Dropon",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "Satus / Disperse Ultra",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Silkon",
        "productId": "vittia__silkon"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Rubber",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Vycit Neutro",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "HiperFixx",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Ranchero",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Acquamax",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Brenn Oil",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi A20+",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "ICL",
        "name": "Helper Dessek",
        "productId": "icl__helper-dessek"
      },
      {
        "brand": "UNION AGRO",
        "name": "Triomax",
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "MIG / Rsolve Duo",
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "New Reduce",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Poliflex",
        "productId": "vittia__poliflex"
      },
      {
        "brand": "GENICA",
        "name": "Vycit Redutor",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Acquamax Power+",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Orama",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Super Clean",
        "productId": "vittia__super-clean"
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Clean",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Dinamus",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Rsolve",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Magic-Oil",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Du Fol",
        "productId": "vittia__du-fol"
      },
      {
        "brand": "GRAN7",
        "name": "Emulsoy",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Sulper",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Thiomax",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Essence",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Expell",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Support",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "BioEnergy *",
        "productId": "vittia__bioenergy"
      },
      {
        "brand": "AGRIVALLE",
        "name": "CoMoNi / Raizer",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Acadian **",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Max Raiz",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "TMSP Power",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "BioNautus **",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Roadster **",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Domain Complex",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Stingray **",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "BlackGold",
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Sustent *",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "Kymon",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Fertium",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Sten",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Volt",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "MixFull *",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Orggam / Ferggum",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "DimiLom",
        "productId": null
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Megafol",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Physio Crop Full",
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Revita",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "Ubyverde",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Bioamino Premium",
        "productId": "vittia__bioamino-premium"
      },
      {
        "brand": "LALLEMAND",
        "name": "Lalstim Nutri",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "No-Dry",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "BioAtivus",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "GramTop",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Microsix Complex",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "DimiTônico Full",
        "productId": null
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Yield On",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Curative",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "Aminofosfito de Cobre",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Phitopress Cobre",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Prosit",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Strong",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "Dimi Cobre",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Grow N",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "N32",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Nitromais",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "N30",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "New",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "N42",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Compat Complex",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "Mn130RR",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Mangan 10",
        "productId": "vittia__mangan-10"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Plexxus Mn",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Time RR / Top Mn",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Polyamine Mn Complex",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "MagGreen",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "Mag-8",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Magnésio Max",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Nutri Pro Magnésio",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "Algon",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Evo Mag",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "MG 8,5",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Set-in",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Boro 10",
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "BorOn",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "MS-Boro",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Boro",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Boro",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "BoroPlex",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Bor Folha",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Boro 10",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "UNION AGRO",
        "name": "Nutry Mn 10",
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "MnEDTA",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Express",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Mn EDTA",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "EfetiveR",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Foto Gen",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "DimiManganes",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "UNION AGRO",
        "name": "Zinco S",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Zinco",
        "productId": "vittia__zinco"
      },
      {
        "brand": "AGRIVALLE",
        "name": "Zinco15",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Zinco 10",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "DimiZinco",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Nitro 22",
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "CoMo ML14",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Nodulus Premium",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "Molibdênio 14",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Evo MoP",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "CoMo10",
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Nitro Ni",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Nodulus Gold",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "TSN CoMo",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Mo10%Co1%",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Mega K Full",
        "productId": "vittia__mega-k-full"
      },
      {
        "brand": "BALLAGRO",
        "name": "Nutri Pro Potássio",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Evo K",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Gran Finnale",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "K- 400 Full",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "UBYFOL",
        "name": "P-50",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "P30",
        "productId": null
      },
      {
        "brand": "BALLAGRO",
        "name": "Rubber",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "P52",
        "productId": null
      },
      {
        "brand": "DIMICRON",
        "name": "Drop",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "UNION AGRO",
        "name": "Nutry Virtus",
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Soja Plus Gold",
        "productId": null
      },
      {
        "brand": "NITRO",
        "name": "Force Mn",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Métis Nutri",
        "productId": "vittia__metis-nutri"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pick Up Win EDTA",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Vigorus",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "SoySixx",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Complex Mais",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Brave Max",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "LALLEMAND",
        "name": "Crystal",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Tarik EC",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "BioBrev  Full",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "BIOMA",
        "name": "TrichProtection",
        "productId": null
      },
      {
        "brand": "FORTGREEN / F1RST AGBIOTECH",
        "name": "Tanus",
        "productId": "f1rst-agbiotech__tanus"
      },
      {
        "brand": "NITRO",
        "name": "Trichodermaiz WP Pro",
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "Tricho-turbo",
        "productId": "vittia__tricho-turbo"
      },
      {
        "brand": "BALLAGRO",
        "name": "Pardella / Ecotrich",
        "productId": null
      },
      {
        "brand": "LALLEMAND",
        "name": "Quality WG",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Congregga",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "NatuControl / Bombardeiro",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "Shocker",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Trichodermil / Trianum",
        "productId": null
      },
      {
        "brand": "GIRO AGRO / VIVA BIO",
        "name": "Tricho Combat Pro",
        "productId": null
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Arvatico",
        "productId": null
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
        "productId": null
      },
      {
        "brand": "VITTIA",
        "name": "No-nema",
        "productId": "vittia__no-nema"
      },
      {
        "brand": "BALLAGRO",
        "name": "Nemat",
        "productId": null
      },
      {
        "brand": "LALLEMAND",
        "name": "Rizos OG",
        "productId": null
      },
      {
        "brand": "GENICA",
        "name": "Dulia / Paladyo",
        "productId": null
      },
      {
        "brand": "BIOTROP",
        "name": "Biomagno / Furatrop",
        "productId": null
      },
      {
        "brand": "AGRIVALLE",
        "name": "Profix",
        "productId": null
      },
      {
        "brand": "KOPPERT",
        "name": "Veraneio / Boneville / Chevelle",
        "productId": null
      },
      {
        "brand": "GRAN7",
        "name": "Vigga / Nematak",
        "productId": null
      },
      {
        "brand": "SYNGENTA BIOLÓGICALS",
        "name": "Arvatico",
        "productId": null
      }
    ]
  }
];
