/** Editorial buying guidance. Technical promises and customer outcomes require separate evidence. */
export const primaryNavigation = [
  { label: 'Products', href: '/products' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Manufacturing', href: '/manufacturing' },
  { label: 'Resources', href: '/resources' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact', href: '/contact-us' },
]

export const buyingContent = [
  {
    kind: 'solution',
    slug: 'drilling-tapping-machining',
    title: 'Drilling and tapping equipment for your workpiece',
    summary:
      'Compare drilling, tapping and milling equipment against the drawing, material, hole pattern and production target. A machine model is a starting point; tooling, clamping and the machining sequence still need review.',
    productSlugs: [
      'manual-drilling-and-tapping-compound-machine',
      'dual-spindles-drilling-tapping-and-milling-compound-machine',
      'vertical-three-four-spindles-machining-center',
      'ta-12',
    ],
    categorySlugs: [
      'drilling-tapping-machine',
      'cnc-drilling-tapping-machine-2',
      'vertical-machining-center-2',
    ],
    relatedSlugs: [
      'machine-selection-checklist',
      'prepare-equipment-rfq',
      'acceptance-and-delivery',
    ],
    sections: [
      {
        heading: 'Begin with the operations, not spindle count',
        body: 'Mark every hole, thread and milled feature on a drawing. Include material, blank dimensions, tolerance, thread specification and any surface finish requirement. Identify which features share a datum and whether the part must be repositioned.',
      },
      {
        heading: 'Compare the equipment routes',
        body: 'The catalog includes manual compound machines, dual spindle compound machines, vertical multi spindle equipment and turret machining centers. Compare the number of operations, tool changes, access directions and changeover needs before choosing a route. More spindles alone do not establish a finished part cycle time.',
      },
      {
        heading: 'Define a representative trial',
        body: 'For an equipment proposal, ask which workpiece, tooling and fixture will be used to check the required features. Define how dimensions, thread quality and the complete operating cycle will be recorded. Include loading and unloading when discussing output.',
      },
    ],
    questions: [
      {
        question: 'Can one machine drill and tap the same part?',
        answer:
          'The catalog includes compound drilling and tapping equipment. Suitability depends on the material, hole and thread requirements, workholding and tool arrangement. Provide the drawing for a configuration review.',
      },
      {
        question: 'How should I compare production output?',
        answer:
          'Use the same part, operations, tooling assumptions and loading method for each proposal. Ask for the full cycle definition rather than comparing spindle speed alone.',
      },
    ],
  },
  {
    kind: 'solution',
    slug: 'valve-faucet-production',
    title: 'Equipment routes for valve and faucet production',
    summary:
      'Explore casting preparation, machining, polishing, assembly and testing equipment for valve and sanitary hardware projects. Select the stages that match your existing line and define the interfaces between them.',
    productSlugs: [
      '550-b-gravity-casting-machine',
      'peeling-machine-for-bathroom-industry',
      'yl-360-f-shower-basin-and-kitchen-faucet-assembly-machine',
      'yl850f-ball-valve-testing-machine',
      'yl-850-faucet-water-testing-machine',
    ],
    categorySlugs: [
      'gravity-casting-machine-2',
      'bathroom-production-machine',
      'assembly-machine-2',
      'testing-machine-2',
    ],
    relatedSlugs: ['custom-equipment-projects', 'prepare-equipment-rfq', 'acceptance-and-delivery'],
    sections: [
      {
        heading: 'Separate the process stages',
        body: 'Map the stages you perform in house and those supplied by a partner. The current catalog covers equipment for casting and core preparation, machining, polishing, assembly and testing. A list of machines does not by itself define an integrated production line.',
      },
      {
        heading: 'Start at the bottleneck',
        body: 'Describe the part entering and leaving the operation, the required output and the existing handling method. For assembly, identify the components and joining operations. For testing, provide the applicable product requirements and the measurements to be recorded.',
      },
      {
        heading: 'Review the interfaces',
        body: 'For a project spanning several stages, discuss part orientation, fixtures, loading, utilities, space and operator responsibilities. Confirm which interfaces are included in each equipment proposal and how the complete process will be checked.',
      },
    ],
    questions: [
      {
        question: 'Can I request equipment for one stage of an existing line?',
        answer:
          'Yes. Begin with the stage you want to discuss, the incoming part condition and the required result. Include information about the adjacent operations so interfaces can be reviewed.',
      },
      {
        question: 'Does a testing machine certify the finished product?',
        answer:
          'A machine’s presence alone does not establish product certification. Agree on the required test method, limits, records and any independent assessment applicable to your product.',
      },
    ],
  },
  {
    kind: 'solution',
    slug: 'custom-equipment-projects',
    title: 'Plan a custom equipment project',
    summary:
      'A custom equipment discussion starts with the workpiece, required operations and acceptance criteria. Define what a standard configuration can cover and which fixtures, handling or process steps need a separate engineering review.',
    productSlugs: [
      'special-purpose-machine-and-parts-customized',
      'horizontal-oil-cylinder-machining-center',
      '5g-terminal-machining-center',
    ],
    categorySlugs: ['special-purpose-machine', 'vertical-machining-center-2'],
    relatedSlugs: [
      'drilling-tapping-machining',
      'prepare-equipment-rfq',
      'acceptance-and-delivery',
    ],
    sections: [
      {
        heading: 'Describe the current process',
        body: 'Explain how the part is made today, where time or quality is lost and which operations must remain unchanged. Include drawings, material, part variants, target output and the available installation space.',
      },
      {
        heading: 'Make the project boundary explicit',
        body: 'Discuss fixtures, tooling, feeding, controls, utilities and connections to existing equipment. Record what the proposal includes and what the buyer or another supplier provides. Confirm documentation, training and service requirements before an order.',
      },
      {
        heading: 'Agree how the result will be checked',
        body: 'Define the sample parts, measurements, operating sequence and records needed for acceptance. Changes to the workpiece or required process should be reviewed against the agreed scope, schedule and quotation.',
      },
    ],
    questions: [
      {
        question: 'Do I need a final equipment specification before contacting Yueli?',
        answer:
          'You can start with the workpiece drawing and process problem. Identify any unknowns explicitly so the initial discussion can establish what still needs to be measured or confirmed.',
      },
      {
        question: 'Can I use a catalog delivery estimate for a custom project?',
        answer:
          'Confirm the schedule for the actual scope. Engineering, fixtures, samples and acceptance arrangements can affect a custom project, so a general estimate should not be treated as an order commitment.',
      },
    ],
  },
  {
    kind: 'guide',
    slug: 'prepare-equipment-rfq',
    title: 'What to include in an equipment RFQ',
    summary:
      'Prepare a workpiece drawing, material specification, required operations, tolerances, target output and destination country. Add the installation constraints and acceptance requirements so equipment proposals can be compared on the same basis.',
    productSlugs: [],
    categorySlugs: ['drilling-tapping-machine', 'special-purpose-machine'],
    relatedSlugs: [
      'drilling-tapping-machining',
      'custom-equipment-projects',
      'machine-selection-checklist',
      'acceptance-and-delivery',
    ],
    sections: [
      {
        heading: 'Workpiece and process',
        body: 'Identify the part and drawing revision. State the material, blank condition, critical dimensions, thread sizes and surface requirements. List the required operations in order and highlight features that need special review.',
      },
      {
        heading: 'Production and installation',
        body: 'State target output together with working hours, batch sizes and the range of parts. Describe the intended loading method, available floor space, utilities and destination country. Flag any existing machine or handling interface.',
      },
      {
        heading: 'Scope and acceptance',
        body: 'Ask the proposal to identify included tooling, fixtures, options, documentation, packing and support. State how you want sample parts and machine operation to be evaluated. Request confirmation of price validity, schedule and the payment and delivery terms for this scope.',
      },
      {
        heading: 'Send the brief',
        body: 'Use the project inquiry form for the initial description. Drawings can be discussed with the Yueli team by the contact email shown on this website; the inquiry form does not upload files. Share only documents you are authorized to provide.',
      },
    ],
    questions: [
      {
        question: 'What if I do not know the required machine model?',
        answer:
          'Describe the part and the required result instead. The machine selection discussion can then start from the operations and constraints.',
      },
      {
        question: 'Should I include a production target?',
        answer:
          'Yes. Include the operating hours, batch size and loading assumptions behind the target so the team can understand what it means for the equipment proposal.',
      },
    ],
  },
  {
    kind: 'guide',
    slug: 'machine-selection-checklist',
    title: 'A checklist for comparing machining equipment',
    summary:
      'Compare equipment using the same workpiece and process scope. Review access, travel, tooling, fixtures, changeovers, output assumptions and acceptance checks before treating two machine quotations as equivalent.',
    productSlugs: [
      'dual-spindles-drilling-tapping-and-milling-compound-machine',
      'vertical-three-four-spindles-machining-center',
      'ta-12',
    ],
    categorySlugs: [
      'drilling-tapping-machine',
      'cnc-drilling-tapping-machine-2',
      'cnc-turret-machine',
    ],
    relatedSlugs: [
      'drilling-tapping-machining',
      'prepare-equipment-rfq',
      'acceptance-and-delivery',
    ],
    sections: [
      {
        heading: 'Can the configuration reach every feature?',
        body: 'Review the part envelope, machine travel, tool access and working positions. Ask how the workpiece is located and clamped, and whether a second setup is needed. Check the proposed configuration rather than relying on a model name alone.',
      },
      {
        heading: 'What changes between batches?',
        body: 'List the part variants, tools and fixtures that must change. Ask which adjustments are manual, which settings are stored and what setup information is supplied. Compare the changeover procedure as well as machining time.',
      },
      {
        heading: 'What is included in the output claim?',
        body: 'Ask whether a cycle includes loading, unloading, tool changes, inspection and other handling. Use a representative part and agreed operating conditions when evaluating output. Do not infer finished part capacity from spindle count or maximum speed.',
      },
      {
        heading: 'What should be written into the proposal?',
        body: 'Record the configuration, included accessories, workholding, tooling responsibilities, utilities and acceptance method. Treat unresolved items as questions to close before ordering, rather than assumptions.',
      },
    ],
    questions: [
      {
        question: 'Is maximum spindle speed the deciding specification?',
        answer:
          'It is one specification among several. The material, tooling, required operations, workholding and complete cycle determine whether a configuration fits the project.',
      },
      {
        question: 'How can I compare a compound machine and a machining center?',
        answer:
          'Use a common list of operations and required features. Compare setup count, tool changes, part variants, operator work and the proposed acceptance test.',
      },
    ],
  },
  {
    kind: 'guide',
    slug: 'acceptance-and-delivery',
    title: 'Plan equipment acceptance and delivery',
    summary:
      'Agree on the workpiece, measurements and operating checks before acceptance. Separately confirm packing, shipping responsibilities, installation, training and warranty terms for the final equipment scope.',
    productSlugs: [],
    categorySlugs: ['testing-machine-2', 'special-purpose-machine'],
    relatedSlugs: ['custom-equipment-projects', 'valve-faucet-production', 'prepare-equipment-rfq'],
    sections: [
      {
        heading: 'Prepare an acceptance checklist',
        body: 'Define representative samples, drawing revisions, the features to measure and the records to retain. State the tooling, fixtures and operating conditions used for the checks. Agree how any open items will be documented and resolved.',
      },
      {
        heading: 'Confirm the shipment scope',
        body: 'Ask which machine accessories, documents and spare parts are included. Confirm export packing, destination, transport responsibilities and any installation constraints. Shipping and installation arrangements should be explicit in the order.',
      },
      {
        heading: 'Review support conditions',
        body: 'Yueli’s published contact information describes overseas installation and training as separately quoted services and a 12 month machine warranty with exclusions. Confirm the applicable terms for the actual order, including wear parts, consumables, travel and service responsibilities.',
      },
      {
        heading: 'Keep a handover record',
        body: 'Retain the final configuration, accepted samples or inspection records, manuals and service contacts. Record machine identification and the information needed to explain a service issue. This planning guide does not replace the agreed order terms.',
      },
    ],
    questions: [
      {
        question: 'Is on site installation included automatically?',
        answer:
          'Confirm this in the quotation. The published service description treats overseas installation, training and travel costs as items to be quoted separately.',
      },
      {
        question: 'When should acceptance criteria be agreed?',
        answer:
          'Discuss them during the proposal stage and record the agreed method before the acceptance check. This gives both parties a common basis for reviewing the equipment.',
      },
    ],
  },
] as const

export const categoryGuidance = [
  {
    slug: 'drilling-tapping-machine',
    summary:
      'Compound drilling and tapping equipment for reviewing hole and thread operations on a defined workpiece.',
    selectionNotes:
      'Compare the operations, material, tool positions and clamping requirements. Confirm which handling steps are included when discussing target output.',
    resources: [
      'drilling-tapping-machining',
      'machine-selection-checklist',
      'prepare-equipment-rfq',
    ],
  },
  {
    slug: 'cnc-drilling-tapping-machine-2',
    summary:
      'CNC drilling and tapping configurations for projects that need a defined machining sequence and repeatable setup.',
    selectionNotes:
      'Provide the drawing, thread specification, part variants and required output. Review travel, access and the proposed fixture against the actual workpiece.',
    resources: ['drilling-tapping-machining', 'machine-selection-checklist'],
  },
  {
    slug: 'vertical-machining-center-2',
    summary:
      'Vertical machining equipment for reviewing multi operation and multi spindle production requirements.',
    selectionNotes:
      'Start with the part envelope, feature locations and setup sequence. Confirm the available axes, tooling and access for the proposed configuration.',
    resources: [
      'drilling-tapping-machining',
      'custom-equipment-projects',
      'machine-selection-checklist',
    ],
  },
  {
    slug: 'cnc-turret-machine',
    summary: 'Turret machining equipment for production that requires a planned tool sequence.',
    selectionNotes:
      'Compare the required tools, changing sequence, travel and fixture arrangement. Use the same representative part when reviewing different proposals.',
    resources: ['drilling-tapping-machining', 'machine-selection-checklist'],
  },
  {
    slug: 'assembly-machine-2',
    summary: 'Assembly equipment for selected valve and faucet production operations.',
    selectionNotes:
      'Identify all components, joining steps, part variants and required checks. Explain how parts arrive at and leave the assembly operation.',
    resources: ['valve-faucet-production', 'prepare-equipment-rfq'],
  },
  {
    slug: 'testing-machine-2',
    summary: 'Testing equipment for reviewing valve, faucet and cartridge test requirements.',
    selectionNotes:
      'Provide the applicable test method, limits and required records. A testing machine alone does not establish certification of the finished product.',
    resources: ['valve-faucet-production', 'acceptance-and-delivery'],
  },
  {
    slug: 'special-purpose-machine',
    summary: 'Custom equipment and parts for process requirements that need an engineering review.',
    selectionNotes:
      'Describe the workpiece, current process and required result. Agree on fixtures, handling, interfaces and acceptance responsibilities before confirming the project scope.',
    resources: ['custom-equipment-projects', 'prepare-equipment-rfq', 'acceptance-and-delivery'],
  },
] as const
