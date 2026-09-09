/* Advoc8 replica — card rendering + interactions (no framework) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Data                                                                */
  /* ------------------------------------------------------------------ */

  var PARTY = {
    ALP: 'background-color: #eb1e1e; color: white;',
    ONP: 'background-color: #f6773e; color: white;',
    KAP: 'background-color: #b50403; color: white;',
    IND: 'background-color: #888888; color: white;',
    LP: 'background-color: #1947ab; color: white;',
    LNP: 'background-color: #1947ab; color: white;',
    GRN: 'background-color: #35b651; color: white;',
    NAT: 'background-color: #248000; color: white;',
    CSA: 'background-color: #49b7ee; color: white;'
  };

  var THUMB = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
    '<rect width="96" height="96" fill="#d2ddec"/>' +
    '<path d="M0 70 L30 42 L52 62 L70 48 L96 70 L96 96 L0 96 Z" fill="#b1c2d9"/>' +
    '<circle cx="70" cy="28" r="10" fill="#f6c343"/></svg>'
  );

  // type: 'release' (title card) | 'social' | divider entries {divider}
  window.TIMELINE_ITEMS = [
    { type: 'release', title: 'Press conference - Castle Hill, Sydney',
      authors: [
        { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' },
        { name: 'Chris Bowen', party: 'ALP', juris: 'Federal', role: 'Minister for Climate Change and Energy' }
      ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 14 August',
      bullets: [
        'Over 500,000 home batteries installed in Australia, significantly reducing power bills and emissions.',
        'The Cheaper Home Batteries Program is particularly popular in outer suburbs and regions, driving economic activity and job creation.',
        'Support for the program is high, with three in four Australians backing it, enhancing energy independence and stability.'
      ],
      badges: ['solar panels', 'climate action', 'solar panel'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', pre: 'MOTIONS', title: 'Grocery Prices',
      authors: [ { name: 'Pauline Hanson', party: 'ONP', juris: 'Federal', role: 'Leader of One Nation' } ],
      metaIcon: 'far fa-landmark-flag mr-2', metaIconStyle: '',
      metaText: 'Australian Federal Parliament • Senate • 2 July',
      bullets: [
        'Grocery prices are rising significantly due to net-zero policies, energy costs, foreign land ownership, and regulatory burdens on farmers.',
        'The impact of these factors is severe, with many Australians struggling to afford basic necessities, leading to increased homelessness and reliance on food relief.',
        'Electricity prices have surged due to renewable energy policies, with household energy costs rising dramatically and contributing to the overall cost-of-living crisis.'
      ],
      badges: ['net-zero', 'net zero', 'native forests', 'solar panels', 'solar panel', 'carbon emissions'],
      mute: ['Mute everything from Pauline Hanson'] },

    { divider: 'Older' },

    { type: 'release', pre: 'QUESTIONS WITHOUT NOTICE', title: 'Albanese Government',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'far fa-landmark-flag mr-2', metaIconStyle: '',
      metaText: 'Australian Federal Parliament • House of Reps • 5 November 2025',
      bullets: [
        'Albanese Government questioned on current policies and actions.',
        'Focus on public concerns raised by opposition parties.',
        'Discussion includes responses to economic and social issues.'
      ],
      badges: ['solar panels', 'action', 'climate'],
      mute: ['Mute everything from Anthony Albanese'] },

    { type: 'social', network: 'facebook',
      authors: [ { name: 'Pauline Hanson', party: 'ONP', juris: 'Federal', role: 'Leader of One Nation' } ],
      metaIcon: 'fab fa-facebook mr-2', metaIconStyle: 'color: #4267B2',
      metaText: 'Posted on Facebook • 2 November 2025',
      text: 'One Nation remains the only Party in Australia committed to ending Net Zero by getting out of the UN Paris Accord.\n\nThe torture of higher energy prices will continue under the Nationals’ 40% carbon targets.\n\nNo matter how they try to spin their new policy position, they’re still committing economic terrorism on households and businesses across Australia.…',
      thumb: true,
      badges: ['Net Zero', 'solar panels'],
      mute: ['Mute this Facebook profile', 'Mute everything from Pauline Hanson'] },

    { type: 'social', network: 'facebook',
      authors: [ { name: 'Chris Minns', party: 'ALP', juris: 'NSW', role: 'Premier' } ],
      metaIcon: 'fab fa-facebook mr-2', metaIconStyle: 'color: #4267B2',
      metaText: 'Posted on Facebook • 9 October 2025',
      text: 'It’s been years in the making, but the new Sydney Fish Market is nearing completion, to open its doors to Sydney and the world.\n\nThis project has transformed an industrial corner of the city into something extraordinary, a place where Sydney’s best chefs, retailers, and local favourites will come together on one of the most beautiful waterfronts in the world.\n\nOnce complete, it’ll be the largest…',
      thumb: true,
      badges: ['solar panels', 'net zero'],
      mute: ['Mute this Facebook profile', 'Mute everything from Chris Minns'] },

    { type: 'release', title: 'New Sydney Fish Market nears completion as retailers prepare to reel in locals and visitors',
      authors: [
        { name: 'Chris Minns', party: 'ALP', juris: 'NSW', role: 'Premier' },
        { name: 'Paul Scully', party: 'ALP', juris: 'NSW', role: 'Minister for Planning and Public Spaces' },
        { name: 'Steve Kamper', party: 'ALP', juris: 'NSW', role: 'Minister for Lands and Property' }
      ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 9 October 2025',
      bullets: [
        'The new Sydney Fish Market is nearing completion and will officially open next month, featuring 40 retail stores.',
        'The market will offer diverse dining options with well-known chefs and local favourites, aiming to attract over 6 million visitors annually.',
        'The project emphasises sustainability with solar panels and a 5 Star Green Star rating, and will support 700 jobs during construction and operational phases.'
      ],
      badges: ['solar-panel', 'net zero'],
      mute: ['Mute this Media Release Source', 'Mute everything from Chris Minns'] },

    { type: 'social', network: 'x-twitter',
      authors: [ { name: 'Pauline Hanson', party: 'ONP', juris: 'Federal', role: 'Leader of One Nation' } ],
      metaIcon: 'fab fa-x-twitter mr-2', metaIconStyle: 'color: black',
      metaText: 'Posted on X • 30 September 2025',
      text: 'Who can afford the real cost of Net Zero?\n\nAustralians’ first comprehensive glimpse of the true scale of the renewables revolution have been compiled by conservationists and communities pushing for a better planned rollout.\n\nThe extraordinary scale of intermittent projects comes at a cost of $1.33 trillion, including 25,000 more wind towers with 45,000km of associated roads, and 250 million solar…',
      badges: ['Net Zero', 'solar panels'],
      mute: ['Mute this X (Twitter) profile', 'Mute everything from Pauline Hanson'] },

    { type: 'social', network: 'facebook',
      authors: [ { name: 'Pauline Hanson', party: 'ONP', juris: 'Federal', role: 'Leader of One Nation' } ],
      metaIcon: 'fab fa-facebook mr-2', metaIconStyle: 'color: #4267B2',
      metaText: 'Posted on Facebook • 30 September 2025',
      text: 'Who can afford the real cost of Net Zero?\n\nAustralians’ first comprehensive glimpse of the true scale of the renewables revolution have been compiled by conservationists and communities pushing for a better planned rollout.\n\nThe extraordinary scale of intermittent projects comes at a cost of $1.33 trillion, including 25,000 more wind towers with 45,000km of associated roads, and 250 million solar…',
      thumb: true,
      badges: ['Net Zero', 'solar panels'],
      mute: ['Mute this Facebook profile', 'Mute everything from Pauline Hanson'] },

    { type: 'release', title: 'SPEECH - ADDRESS TO THE AUSTRALIAN’S ENERGY NATION FORUM 2025',
      authors: [ { name: 'Chris Minns', party: 'ALP', juris: 'NSW', role: 'Premier' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 24 September 2025',
      bullets: [
        'New South Wales aims to integrate 12 gigawatts of new energy by 2030, equivalent to over three-quarters of current coal power output.',
        'The government is extending the life of coal plants to avoid reliability issues and facilitate a smooth transition to renewables.',
        'Investment in clean energy is prioritised, with a bipartisan approach to policy and the necessity of gas as a backup for the energy grid.'
      ],
      badges: ['climate action', 'solar panels'],
      mute: ['Mute this Media Release Source', 'Mute everything from Chris Minns'] },

    { type: 'release', title: 'Press conference - Melbourne',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 19 September 2025',
      bullets: [
        'Albanese emphasised the dual benefits of solar energy: reducing living costs and combating climate change.',
        '60,000 Australians have adopted the battery rebate policy since July, leading to significant savings on energy bills.',
        'The Prime Minister affirmed a target to reduce emissions by 62-70% by 2035, contrasting government efforts with the opposition’s unclear stance on climate policy.'
      ],
      badges: ['action', 'climate', 'solar panels', 'Net Zero'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Press conference - Sydney',
      authors: [
        { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' },
        { name: 'Chris Bowen', party: 'ALP', juris: 'Federal', role: 'Minister for Climate Change and Energy' }
      ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 18 September 2025',
      bullets: [
        'Albanese confirms a 2035 emissions reduction target of 62-70% based on expert advice from the Climate Change Authority.',
        'New funding initiatives include $2 billion for the Clean Energy Finance Corporation and a $5 billion Net Zero fund for heavy industry.',
        'Focus areas for emissions reduction include electricity, transport, and industry, with investments in renewable energy and electric vehicle infrastructure.'
      ],
      badges: ['emissions reduction', 'Net Zero', 'solar panel'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Press conference - Cairns',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 12 September 2025',
      bullets: [
        'Prime Minister Albanese visits Cairns, highlighting the government’s focus on regional Queensland and local MP Matt Smith.',
        'Key initiatives discussed include the Urgent Care Clinic, cheaper medicines, and support for renewable energy expansion.',
        'Albanese addresses Torres Strait autonomy and expresses confidence in achieving net zero emissions by 2050 despite opposition from Queensland LNP.'
      ],
      badges: ['solar panels', 'Great Barrier Reef', 'net zero', 'emissions reduction', 'action', 'climate', 'water quality'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Press conference - Adelaide',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 20 August 2025',
      bullets: [
        'Prime Minister Anthony Albanese announced $28 million in funding for South Australia to combat the algal bloom crisis affecting marine life and local industries.',
        'Immediate measures include $4 million for local government grants, $2.25 million for scientific research, and the establishment of a new ecological funding stream.',
        'Collaborative efforts between federal and state governments aim to enhance marine monitoring and expedite testing for brevetoxins in shellfish, improving industry response times.'
      ],
      badges: ['water quality', 'solar panels', 'environmental restoration'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Doorstop - Brisbane',
      authors: [
        { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' },
        { name: 'Chris Bowen', party: 'ALP', juris: 'Federal', role: 'Minister for Climate Change and Energy' }
      ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 13 August 2025',
      bullets: [
        'Therese Townsend shared her experience of installing a solar battery, encouraged by government rebates, during a visit from PM Albanese and MP Kara Cook.',
        'The PM noted that Australia leads in solar panel installations, with 28,000 households benefitting from a home battery rebate program since July.',
        'Chris Bowen highlighted the rapid uptake of the battery program, with 1,000 households installing batteries daily, resulting in significant savings on energy bills.'
      ],
      badges: ['solar panels', 'Net Zero'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', pre: 'MATTERS OF URGENCY', title: 'Climate Change',
      authors: [ { name: 'Pauline Hanson', party: 'ONP', juris: 'Federal', role: 'Leader of One Nation' } ],
      metaIcon: 'far fa-landmark-flag mr-2', metaIconStyle: '',
      metaText: 'Australian Federal Parliament • Senate • 28 July 2025',
      bullets: [
        'Climate change identified as an urgent matter requiring immediate attention.',
        'Calls for significant policy reform to tackle environmental issues.',
        'Debate includes various perspectives on the effectiveness of current climate strategies.'
      ],
      badges: ['net-zero', 'Net zero', 'carbon emissions', 'solar panels'],
      mute: ['Mute everything from Pauline Hanson'] },

    { type: 'release', title: 'Doorstop interview - Sydney',
      authors: [
        { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' },
        { name: 'Chris Bowen', party: 'ALP', juris: 'Federal', role: 'Minister for Climate Change and Energy' }
      ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 28 February 2025',
      bullets: [
        'Prime Minister Anthony Albanese announces a $25 million Solar for Residents Initiative to co-fund rooftop solar installations for apartments, aiming to reduce power bills and emissions.',
        'The initiative is a partnership with the NSW Government, aimed at making solar energy more accessible for apartment dwellers, who currently have low adoption rates.',
        'Albanese criticises the Coalition’s lack of a credible energy plan and highlights the government’s success in increasing renewable energy production in Australia.'
      ],
      badges: ['solar panels', 'action', 'climate', 'emissions reduction'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Television interview - ABC Insiders',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 17 November 2024',
      bullets: [
        'Prime Minister Albanese emphasised Australia’s national interests in free trade and climate change during the APEC Summit.',
        'He noted that one in four Australian jobs depends on trade, highlighting APEC’s importance for Australia.',
        'Albanese addressed concerns about potential trade wars and confirmed advocacy for Australia’s trade interests amidst changes under Trump’s administration.'
      ],
      badges: ['action', 'climate', 'net zero', 'solar panels'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'social', network: 'x-twitter',
      authors: [ { name: 'Pauline Hanson', party: 'ONP', juris: 'Federal', role: 'Leader of One Nation' } ],
      metaIcon: 'fab fa-x-twitter mr-2', metaIconStyle: 'color: black',
      metaText: 'Posted on X • 19 July 2024',
      text: 'Media Release | Watt and Labor hypocrites on water for farming\n\nLabor agriculture minister Murray Watt’s argument that an Australian nuclear power industry might divert water resources from farming might hold some water if Labor wasn’t already taking the precious resource from them.\n\nOne Nation leader Senator Pauline Hanson said if Labor was serious about water for farmers, it would not be taking…',
      badges: ['water resources', 'Murray Darling Basin', 'solar panels'],
      mute: ['Mute this X (Twitter) profile', 'Mute everything from Pauline Hanson'] },

    { type: 'social', network: 'facebook',
      authors: [ { name: 'Pauline Hanson', party: 'ONP', juris: 'Federal', role: 'Leader of One Nation' } ],
      metaIcon: 'fab fa-facebook mr-2', metaIconStyle: 'color: #4267B2',
      metaText: 'Posted on Facebook • 19 July 2024',
      text: 'Media Release | Watt and Labor hypocrites on water for farming\n\nLabor agriculture minister Murray Watt’s argument that an Australian nuclear power industry might divert water resources from farming might hold some water if Labor wasn’t already taking the precious resource from them.\n\nOne Nation leader Senator Pauline Hanson said if Labor was serious about water for farmers, it would not be taking…',
      thumb: true,
      badges: ['water resources', 'Murray Darling Basin', 'solar panels'],
      mute: ['Mute this Facebook profile', 'Mute everything from Pauline Hanson'] },

    { type: 'release', title: 'Press conference - Townsville',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 19 July 2024',
      bullets: [
        'Prime Minister Anthony Albanese highlights the significance of the Port of Townsville, which supports 2,000 jobs, including many locals, and is crucial for the North Queensland economy.',
        'Albanese announces Edwina Andrew as Labor’s candidate for Herbert in the next federal election, emphasising the need for more Labor representation in Queensland.',
        'The widening of the port channel is a joint investment aimed at enhancing export capabilities for critical minerals and improving infrastructure in the region.'
      ],
      badges: ['solar panels', 'emissions reduction', 'net zero', 'net-zero'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Radio interview - ABC Radio National Breakfast',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 20 June 2024',
      bullets: [
        'Albanese criticises Coalition’s nuclear energy policy, calling it a fantasy with no detailed costings or timeframe',
        'Albanese highlights renewable energy progress under his government, citing increased investment and cheaper costs compared to nuclear',
        'Albanese accuses Coalition of setting unreliable terms in energy debate and predicts economic catastrophe with nuclear plan'
      ],
      badges: ['solar panels', 'emissions reduction', 'net zero'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Podcast - The Guardian Australian Politics',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 13 June 2024',
      bullets: [
        'Anthony Albanese discusses the sharpening contest between him and Peter Dutton, the resurgent climate wars, condemnation of the Greens over Gaza protests, and the Government’s stance on reform',
        'Albanese criticises Dutton for lack of 2030 emissions target, points out flaws in nuclear energy proposal, and emphasises importance of renewables in addressing climate change',
        'Albanese highlights the economic benefits of climate action, the need for community consultation, and Australia’s potential to become a renewable energy superpower'
      ],
      badges: ['emissions reduction', 'climate action', 'net zero', 'solar panels', 'action', 'climate', 'Murray Darling Basin'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'Press conference',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 10 June 2024',
      bullets: [
        'Albanese criticises Peter Dutton for abandoning climate action and the 2030 target, highlighting the importance of cooperation with trading partners and allies',
        'Albanese emphasises the success of Labor’s climate policies, including a 2030 target of 43 per cent and net zero by 2050, and the need for business certainty for investment and job creation',
        'Albanese expresses confidence in meeting climate targets, discusses accountability, policies, and the importance of transitioning to a clean energy future'
      ],
      badges: ['climate action', 'action', 'climate', 'net zero', 'solar panels'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] },

    { type: 'release', title: 'What’s better: Chinese CO2 or Australian ethanol?',
      authors: [ { name: 'Bob Katter', party: 'KAP', juris: 'Federal', role: 'Member for Kennedy (QLD)' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 29 May 2024',
      bullets: [
        'Bob Katter questions Australians using solar panels made with Chinese coal to charge EVs, suggests using biofuels for emissions reduction',
        'Highlights $48bn spent on overseas fuel purchases, proposes manufacturing own ethanol like Brazil',
        'Calls for action on tangible solutions like converting sugar mills for ethanol production and irrigation projects'
      ],
      badges: ['solar panels', 'net zero', 'emissions reductions', 'emissions reduction', 'Great Barrier Reef'],
      mute: ['Mute this Media Release Source', 'Mute everything from Bob Katter'] },

    { type: 'release', title: 'Question and answer - Perth',
      authors: [ { name: 'Anthony Albanese', party: 'ALP', juris: 'Federal', role: 'Prime Minister' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 9 May 2024',
      bullets: [
        'Albanese announces joint funding with Cook Government for planning Westport project',
        'Over $70 million committed for infrastructure projects in Perth',
        'Discussion on importance of planning for infrastructure projects'
      ],
      badges: ['solar panels', 'environmental outcomes'],
      mute: ['Mute this Media Release Source', 'Mute everything from Anthony Albanese'] }
  ];

  window.SEARCH_ITEMS = [
    { type: 'release', title: 'Court deals with abalone offences',
      org: { name: 'WA Department of Primary Industries and Regional Development', juris: 'WA' },
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 8 September',
      bullets: [
        'A 23-year-old man fined $2,004.90 for illegal collection of 41 Roe’s abalone near Mindarie Marina.',
        'Another man, aged 22, ordered to pay $1,366.10 for taking 20 abalone on 30 November.',
        'Fishing for Roe’s abalone is restricted to licensed fishers during specific hours from December to February.',
        'Significant penalties apply for fishing outside designated hours, including fines up to $40,000.',
        'Reports of illegal fishing can be made to FishWatch at 1800 815 507.'
      ],
      badges: [], mute: ['Mute this Media Release Source'] },

    { type: 'release', title: 'Premier’s “New Direction” Looks Like More Of The Same',
      org: { name: 'Family First Party', juris: 'SA' },
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 8 September',
      bullets: [
        'Jane Foreman claims Premier Ben Carroll’s anti-corruption laws lack integrity and protect the government.',
        'The legislation prevents IBAC from investigating past referrals, including allegations linked to the Big Build.',
        'Both the Coalition and the Greens oppose the Bill, agreeing it is designed to shield the government.',
        'Foreman urges the Premier to remove the clause restricting IBAC’s powers regarding past matters.'
      ],
      badges: [], mute: ['Mute this Media Release Source'] },

    { type: 'release', title: 'Get Ready Weekend 2026',
      org: { name: 'NSW Rural Fire Service', juris: 'NSW' },
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 8 September',
      bullets: [
        'Event to be held on 19-20 September 2026 for bushfire preparedness.',
        'Residents can learn to create a Bushfire Survival Plan and maintain property safety.',
        'Local RFS brigades will provide resources and activities for families.',
        'Important to understand Fire Danger Ratings and ensure property safety ahead of the bushfire season.'
      ],
      badges: [], mute: ['Mute this Media Release Source'] },

    { type: 'release', title: 'Put Australians Ahead of UN Junkets',
      authors: [ { name: 'Malcolm Roberts', party: 'ONP', juris: 'Federal', role: 'Senator for Queensland (QLD)' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 8 September',
      bullets: [
        'Malcolm Roberts questioned Minister Murray Watt about taxpayer money spent on UN climate events, revealing $147.8 million allocated under a budget measure for COP31.',
        'Officials could not provide specific costs for international travel or the total budget for COP31 attendance, which remains undecided.',
        'Roberts challenged the necessity of international climate agreements imposed on Australia, citing other nations’ withdrawal and calling for greater transparency in spending.'
      ],
      badges: [], mute: ['Mute this Media Release Source', 'Mute everything from Malcolm Roberts'] },

    { type: 'release', title: 'The 1,535 Page Dodge',
      authors: [ { name: 'Malcolm Roberts', party: 'ONP', juris: 'Federal', role: 'Senator for Queensland (QLD)' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 8 September',
      bullets: [
        'Malcolm Roberts confronted officials over 1,535 pages of unindexed data on M1 motorway works, demanding accountability.',
        'Minister Chisholm defended the information as excessive, but Roberts highlighted the lack of transparency.',
        'Officials eventually provided a summary of $2.2 billion in federal funding for M1 projects since 2019.'
      ],
      badges: [], mute: ['Mute this Media Release Source', 'Mute everything from Malcolm Roberts'] },

    { type: 'release', title: 'Haines says political parties are rorting taxpayers’ money for political gain',
      authors: [ { name: 'Helen Haines', party: 'IND', juris: 'Federal', role: 'Deputy Chair of Parliamentary Joint Committee on the National Anti-Corruption Commission' } ],
      metaIcon: 'fas fa-newspaper fa-fw mr-1', metaIconStyle: 'color: #f49e00;',
      metaText: 'Media Release • 8 September',
      bullets: [
        'Helen Haines demands an overhaul of Commonwealth grants following analysis showing $560 million funding favours marginal electorates.',
        'Calls for open application processes and independent oversight to ensure fair funding distribution.',
        'Critiques major parties for using taxpayer money for political gain, urging a focus on community needs.'
      ],
      badges: [], mute: ['Mute this Media Release Source', 'Mute everything from Helen Haines'] }
  ];

  /* ------------------------------------------------------------------ */
  /* Card templates (markup mirrors the live app exactly)                */
  /* ------------------------------------------------------------------ */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function authorBlock(a) {
    return '' +
      '<a class="text-reset" href="#">' +
        '<div class="d-md-flex flex-gap-2 align-items-baseline my-1">' +
          '<h4 class="font-weight-bold small mb-md-0 mb-1" style="width: fit-content;">' +
            '<div class="d-flex align-items-center flex-gap-2">' +
              '<span style="white-space:nowrap;">' + esc(a.name) + '</span>' +
              '<div class="d-inline-flex flex-gap-1 small">' +
                '<span class="badge party" style="' + (PARTY[a.party] || '') + '">' + esc(a.party) + '</span>' +
                '<span class="badge bg-secondary-soft text-dark">' + esc(a.juris) + '</span>' +
              '</div>' +
            '</div>' +
          '</h4>' +
          '<h5 class="text-muted font-weight-normal mb-0 small text-truncate">' + esc(a.role) + '</h5>' +
        '</div>' +
      '</a>';
  }

  function orgBlock(o) {
    return '' +
      '<a class="text-reset" href="#">' +
        '<div class="d-flex flex-gap-2 align-items-baseline my-1">' +
          '<h4 class="font-weight-bold small mb-0">' +
            '<span class="pr-2">' + esc(o.name) + '</span>' +
            '<small><span class="badge bg-secondary-soft text-dark">' + esc(o.juris) + '</span></small>' +
          '</h4>' +
        '</div>' +
      '</a>';
  }

  function hoverControls(item, idx) {
    var muteItems = (item.mute || []).map(function (m) {
      return '<a class="dropdown-item" href="#">' + esc(m) + '</a>';
    }).join('');
    return '' +
      '<div class="z-3 position-absolute top-0 right-0 mt-3 mr-3 hover-reveal__hidden">' +
        '<div class="d-flex flex-gap-2">' +
          '<div class="dropdown">' +
            '<button class="btn btn-white btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
              '<i class="far fa-share-from-square fa-fw mr-1"></i> Share' +
            '</button>' +
            '<div class="dropdown-menu dropdown-menu-right">' +
              '<a class="dropdown-item" href="#"><i class="fa-regular fa-paper-plane mr-3"></i>Email</a>' +
              '<a class="dropdown-item" href="#"><i class="fa-regular fa-copy mr-3"></i>Copy Link</a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div id="labels_button_' + idx + '">' +
              '<button class="btn btn-white btn-sm js-save-btn" type="button">' +
                '<i class="fa-regular fa-bookmark fa-fw mr-1"></i> Save' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<button class="btn btn-white btn-sm js-expand-btn" type="button" aria-label="Open in reader" data-tooltip="Open in reader"><i class="far fa-arrows-maximize fa-fw"></i></button>' +
        '</div>' +
      '</div>';
  }

  function releaseCard(item, idx) {
    var byline = item.org ? orgBlock(item.org) : (item.authors || []).map(function (a, i) {
      if (i === 0) return authorBlock(a);
      return '<div class="d-flex align-items-center flex-gap-1 text-gray-700">' +
               '<i class="fal fa-handshake fa-fw mr-1 z-3"></i>' +
               '<div style="min-width: 0;">' + authorBlock(a) + '</div>' +
             '</div>';
    }).join('');
    // first author sits alone inside the position-relative wrapper
    var firstAuthor = '';
    var restAuthors = '';
    if (item.org) {
      firstAuthor = orgBlock(item.org);
    } else if (item.authors && item.authors.length) {
      firstAuthor = authorBlock(item.authors[0]);
      restAuthors = item.authors.slice(1).map(function (a) {
        return '<div class="d-flex align-items-center flex-gap-1 text-gray-700">' +
                 '<i class="fal fa-handshake fa-fw mr-1 z-3"></i>' +
                 '<div style="min-width: 0;">' + authorBlock(a) + '</div>' +
               '</div>';
      }).join('');
    }
    var bullets = (item.bullets || []).map(function (b) {
      return '<li class="pb-1">' + esc(b) + '</li>';
    }).join('');
    var badges = (item.badges || []).map(function (b) {
      return '<span class="badge badge-soft-primary">' + esc(b) + '</span>';
    }).join('\n');
    return '' +
      '<div class="mb-3" data-card-type="' + cardFilterType(item) + '">' +
        '<div class="card card-sm hover-gray-bg hover-reveal mb-2">' +
          hoverControls(item, idx) +
          '<div class="border-bottom card-body">' +
            (item.pre ? '<p class="small card-text text-gray-700 mb-2">' + esc(item.pre) + '</p>' : '') +
            '<a class="stretched-link text-reset" href="#">' +
              '<h3 class="card-title font-weight-bold mb-2">' + esc(item.title) + '</h3>' +
            '</a>' +
            '<div class="text-gray-800 mb-2 z-2 position-relative">' + firstAuthor + '</div>' +
            restAuthors +
            '<p class="small card-text mb-0 text-gray-700">' +
              '<i class="' + item.metaIcon + '" style="' + (item.metaIconStyle || '') + '"></i>' +
              esc(item.metaText) +
            '</p>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="card-text text-gray-800 feed-body">' +
              '<div><div class="forDumbOutlooks"><ul class="m-0 px-4">' + bullets + '</ul></div></div>' +
            '</div>' +
            (badges ? '<p class="card-text mt-2">' + badges + '</p>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function socialCard(item, idx) {
    var badges = (item.badges || []).map(function (b) {
      return '<span class="badge badge-soft-primary">' + esc(b) + '</span>';
    }).join('\n');
    var text = esc(item.text || '').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    return '' +
      '<div class="mb-3" data-card-type="' + cardFilterType(item) + '">' +
        '<div class="card card-sm hover-gray-bg hover-reveal mb-2">' +
          hoverControls(item, idx) +
          '<div class="border-bottom card-body">' +
            '<div class="text-gray-800 mb-2 z-2 position-relative">' + authorBlock(item.authors[0]) + '</div>' +
            '<p class="small card-text mb-0 text-gray-700">' +
              '<i class="' + item.metaIcon + '" style="' + (item.metaIconStyle || '') + '"></i>' +
              esc(item.metaText) +
            '</p>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="card-text text-gray-800 feed-body">' + text + '</div>' +
            (item.thumb ?
              '<div class="row rounded overflow-hidden mt-3 mx-1">' +
                '<div class="p-0 mr-2"><img class="img-fluid avatar-img avatar-lg rounded replica-thumb-placeholder" src="' + THUMB + '" alt=""></div>' +
              '</div>' : '') +
            '<a class="stretched-link" style="opacity: 0; height: 0px; display: block;" href="#">Open Post</a>' +
            (badges ? '<p class="card-text mt-2">' + badges + '</p>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function cardFilterType(item) {
    if (item.type === 'social') return 'social';
    if (/Parliament/.test(item.metaText)) return 'parliament';
    return 'media';
  }

  function dividerBlock(text) {
    return '<h2 class="font-weight-bold mt-5 mb-4" data-divider>' + esc(text) + '</h2>';
  }

  function renderItems(containerId, items) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map(function (item, idx) {
      if (item.divider) return dividerBlock(item.divider);
      return item.type === 'social' ? socialCard(item, idx) : releaseCard(item, idx);
    }).join('\n');
  }

  /* ------------------------------------------------------------------ */
  /* Interactions                                                        */
  /* ------------------------------------------------------------------ */

  function closeAllDropdowns(except) {
    document.querySelectorAll('.dropdown-menu.show').forEach(function (m) {
      if (m !== except) m.classList.remove('show');
    });
    document.querySelectorAll('.dropdown.show, .dropup.show').forEach(function (d) {
      if (!except || !d.contains(except)) d.classList.remove('show');
    });
    document.querySelectorAll('.dropdown-card:not(.d-none)').forEach(function (c) {
      if (c !== except) c.classList.add('d-none');
    });
  }

  document.addEventListener('click', function (e) {
    // Bootstrap-style dropdowns
    var toggle = e.target.closest('[data-toggle="dropdown"]');
    if (toggle) {
      e.preventDefault();
      var parent = toggle.closest('.dropdown, .dropup, .floating-action-button');
      var menu = parent ? parent.querySelector('.dropdown-menu') : null;
      if (menu) {
        var isOpen = menu.classList.contains('show');
        closeAllDropdowns();
        if (!isOpen) {
          menu.classList.add('show');
          if (parent) parent.classList.add('show');
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
      return;
    }

    // Filter pill dropdown-cards (Parliament / Social Media / Other / Time frame)
    var pillToggle = e.target.closest('.filter-pills a.nav-link, .js-timeframe > a.nav-link, .js-pill-dropdown > a.nav-link');
    if (pillToggle && pillToggle.parentElement.querySelector('.dropdown-card')) {
      e.preventDefault();
      var card = pillToggle.parentElement.querySelector('.dropdown-card');
      var wasHidden = card.classList.contains('d-none');
      closeAllDropdowns();
      if (wasHidden) card.classList.remove('d-none');
      return;
    }

    // Collapse toggles (filter modal accordion) with grow/shrink animation
    var colToggle = e.target.closest('[data-toggle="collapse"]');
    if (colToggle) {
      e.preventDefault();
      var target = document.querySelector(colToggle.getAttribute('data-target'));
      if (target) {
        var willShow = !target.classList.contains('show');
        window.replicaSlide(target, willShow);
        colToggle.classList.toggle('collapsed', !willShow);
        colToggle.setAttribute('aria-expanded', willShow ? 'true' : 'false');
        var chev = colToggle.parentElement.querySelector('.accordion-chevron');
        if (chev) chev.classList.toggle('rot90', willShow);
      }
      return;
    }

    // Modal open
    var modalTrigger = e.target.closest('.filter-button');
    if (modalTrigger) {
      e.preventDefault();
      openModal(document.getElementById('filterModal'));
      return;
    }

    // Modal close (X button, backdrop, Show Results)
    if (e.target.closest('.modal .close') || e.target.classList.contains('modal') ||
        e.target.closest('.js-show-results')) {
      var openM = document.querySelector('.modal.show');
      if (openM) { e.preventDefault(); closeModal(openM); }
      if (e.target.closest('.js-show-results')) e.preventDefault();
      return;
    }

    // Clear All inside modal
    if (e.target.closest('.js-clear-all')) {
      e.preventDefault();
      var modal = e.target.closest('.modal');
      modal.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; });
      modal.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = r.value === 'All Time'; });
      return;
    }

    // Save button toggle
    var saveBtn = e.target.closest('.js-save-btn');
    if (saveBtn) {
      var ic = saveBtn.querySelector('i');
      var saved = ic.classList.toggle('fa-solid');
      ic.classList.toggle('fa-regular', !saved);
      saveBtn.childNodes[saveBtn.childNodes.length - 1].textContent = saved ? ' Saved' : ' Save';
      return;
    }

    // Pill dropdown Apply / Clear Filter
    var applyBtn = e.target.closest('.dropdown-card .btn-primary');
    if (applyBtn) {
      e.preventDefault();
      var dc = applyBtn.closest('.dropdown-card');
      var li = dc.parentElement;
      if (li.classList.contains('js-timeframe')) {
        var checked = dc.querySelector('input[type=radio]:checked');
        if (checked && window.replicaApplyTimeframe) {
          var lbl = dc.querySelector('label[for="' + checked.id + '"]');
          window.replicaApplyTimeframe(lbl ? lbl.textContent.trim() : 'Last 6 months');
        }
        dc.classList.add('d-none');
        return;
      }
      var pill = dc.parentElement.querySelector('a.nav-link');
      var any = [].slice.call(dc.querySelectorAll('input[type=checkbox]')).some(function (c) { return c.checked; });
      if (pill) pill.classList.toggle('active', any);
      dc.classList.add('d-none');
      applyContentTypeFilter();
      return;
    }
    var clearBtn = e.target.closest('.dropdown-card .btn-link');
    if (clearBtn) {
      e.preventDefault();
      var dc2 = clearBtn.closest('.dropdown-card');
      if (dc2.parentElement.classList.contains('js-timeframe')) {
        var def = dc2.querySelector('input[value="Last 6 months"], #search_relative_range_Last_6_months');
        dc2.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = r === def; });
        if (window.replicaApplyTimeframe) window.replicaApplyTimeframe('Last 6 months');
        dc2.classList.add('d-none');
        return;
      }
      dc2.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; });
      var pill2 = dc2.parentElement.querySelector('a.nav-link');
      if (pill2) pill2.classList.remove('active');
      dc2.classList.add('d-none');
      applyContentTypeFilter();
      return;
    }

    // Tabs (Timeline / Analysis)
    var tab = e.target.closest('.nav-tabs .nav-link');
    if (tab) {
      e.preventDefault();
      tab.closest('.nav-tabs').querySelectorAll('.nav-link').forEach(function (t) {
        t.classList.toggle('active', t === tab);
      });
      var isAnalysis = /Analysis/.test(tab.textContent);
      var list = document.getElementById('timeline-cards');
      var empty = document.getElementById('analysis-empty');
      if (list && empty) {
        list.classList.toggle('d-none', isAnalysis);
        empty.classList.toggle('d-none', !isAnalysis);
      }
      return;
    }

    // Sidebar feeds group caret
    var groupToggle = e.target.closest('.nav-group-heading > a[aria-controls]');
    if (groupToggle) {
      e.preventDefault();
      var grp = document.getElementById(groupToggle.getAttribute('aria-controls'));
      var expanded = groupToggle.getAttribute('aria-expanded') === 'true';
      groupToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (grp) grp.classList.toggle('d-none', expanded);
      return;
    }

    // Media Releases pill (checkbox label) — let the change handler run
    if (e.target.closest('.filter-pills label.nav-link')) {
      // native label→checkbox behavior fires 'change'
    } else if (!e.target.closest('.dropdown-card')) {
      closeAllDropdowns();
    }
  });

  /* Modal helpers */
  function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'block';
    requestAnimationFrame(function () { modal.classList.add('show'); });
    document.body.classList.add('modal-open');
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade';
    backdrop.id = 'replica-backdrop';
    document.body.appendChild(backdrop);
    requestAnimationFrame(function () { backdrop.classList.add('show'); });
  }
  function closeModal(modal) {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    var backdrop = document.getElementById('replica-backdrop');
    setTimeout(function () {
      modal.style.display = 'none';
      if (backdrop) backdrop.remove();
    }, 150);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var m = document.querySelector('.modal.show');
      if (m) closeModal(m);
      closeAllDropdowns();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      var inp = document.querySelector('.index-search-box input[type=search]');
      if (inp) inp.focus();
    }
  });

  /* Exact Dates reveals the date range inputs */
  document.addEventListener('change', function (e) {
    if (e.target.matches('input[name="search[relative_range]"]')) {
      var li = e.target.closest('ul').querySelector('li.d-none, li.js-exact-dates');
      var exactLi = e.target.closest('ul').querySelector('.js-exact-dates');
      if (exactLi) exactLi.classList.toggle('d-none', !/exact/i.test(e.target.id));
    }
    // Select-all checkboxes in pill dropdowns and jurisdiction table
    if (e.target.matches('[id^="select_all_"], [id$="_select_all"]')) {
      var scope = e.target.closest('.d-table-row, .dropdown-card, .card-body');
      if (scope) {
        scope.querySelectorAll('input[type=checkbox]').forEach(function (c) {
          if (c !== e.target) c.checked = e.target.checked;
        });
      }
    }
    // Media Releases pill checkbox
    if (e.target.matches('.filter-pills input[type=checkbox].d-none')) {
      var lbl = e.target.closest('label.nav-link');
      if (lbl) lbl.classList.toggle('active', e.target.checked);
      applyContentTypeFilter();
    }
  });

  /* Content-type filtering of visible cards */
  function applyContentTypeFilter() {
    var container = document.getElementById('timeline-cards') || document.getElementById('search-results');
    if (!container) return;
    var mediaOn = false, parliamentOn = false, socialOn = false;
    var mediaPill = document.querySelector('.filter-pills label.nav-link input');
    if (mediaPill && mediaPill.checked) mediaOn = true;
    document.querySelectorAll('.filter-pills li').forEach(function (li) {
      var link = li.querySelector('a.nav-link.active');
      if (!link) return;
      if (/Parliament/.test(link.textContent)) parliamentOn = true;
      if (/Social Media/.test(link.textContent)) socialOn = true;
    });
    var anyFilter = mediaOn || parliamentOn || socialOn;
    container.querySelectorAll('[data-card-type]').forEach(function (card) {
      var t = card.getAttribute('data-card-type');
      var show = !anyFilter ||
        (mediaOn && t === 'media') ||
        (parliamentOn && t === 'parliament') ||
        (socialOn && t === 'social');
      card.classList.toggle('d-none', !show);
    });
    updateDividers(container);
  }

  /* Text search over cards */
  function wireSearch(inputSel, containerId) {
    var inp = document.querySelector(inputSel);
    var container = document.getElementById(containerId);
    if (!inp || !container) return;
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase();
      container.querySelectorAll('[data-card-type]').forEach(function (card) {
        var match = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.classList.toggle('d-none', !match);
      });
      updateDividers(container);
      var count = document.getElementById('results-count');
      if (count) {
        var visible = container.querySelectorAll('[data-card-type]:not(.d-none)').length;
        count.textContent = q ? (visible + ' results') : count.getAttribute('data-default');
      }
    });
  }

  function updateDividers(container) {
    container.querySelectorAll('[data-divider]').forEach(function (h) {
      var anyAfter = false;
      var el = h.nextElementSibling;
      while (el) {
        if (el.hasAttribute('data-card-type') && !el.classList.contains('d-none')) { anyAfter = true; break; }
        el = el.nextElementSibling;
      }
      h.classList.toggle('d-none', !anyAfter);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  window.replicaRender = renderItems;
  window.replicaEsc = esc;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('sample-results')) {
      renderItems('sample-results', window.TIMELINE_ITEMS.slice(0, 4).filter(function (i) { return !i.divider; }));
    }
    if (document.getElementById('timeline-cards')) {
      renderItems('timeline-cards', window.TIMELINE_ITEMS);
      wireSearch('.index-search-box input[type=search]', 'timeline-cards');
    }
    if (document.getElementById('search-results') && !window.SEARCH_DATA) {
      renderItems('search-results', window.SEARCH_ITEMS);
      wireSearch('.index-search-box input[type=search]', 'search-results');
    }
  });
})();


/* Animated expand/collapse (Bootstrap-style height transition) */
window.replicaSlide = function (el, show, duration) {
  duration = duration || 300;
  if (el.__sliding) return;
  el.__sliding = true;
  el.style.overflow = 'hidden';
  if (show) {
    el.classList.add('show');
    el.style.height = '0px';
    var h = el.scrollHeight;
    requestAnimationFrame(function () {
      el.style.transition = 'height ' + duration + 'ms ease';
      el.style.height = h + 'px';
    });
    setTimeout(function () {
      el.style.height = ''; el.style.transition = ''; el.style.overflow = '';
      el.__sliding = false;
    }, duration + 30);
  } else {
    el.style.height = el.scrollHeight + 'px';
    requestAnimationFrame(function () {
      el.style.transition = 'height ' + duration + 'ms ease';
      el.style.height = '0px';
    });
    setTimeout(function () {
      el.classList.remove('show');
      el.style.height = ''; el.style.transition = ''; el.style.overflow = '';
      el.__sliding = false;
    }, duration + 30);
  }
};

/* Styled tooltip for [data-tooltip] elements (mirrors the app's dark tooltip) */
(function () {
  var tip = null;
  document.addEventListener('click', function () { if (tip) { tip.remove(); tip = null; } }, true);
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest('[data-tooltip]');
    if (el && !tip) {
      tip = document.createElement('div');
      tip.className = 'replica-tooltip';
      tip.textContent = el.getAttribute('data-tooltip');
      document.body.appendChild(tip);
      var r = el.getBoundingClientRect();
      var rail = document.documentElement.classList.contains('nav-collapsed') && el.closest('.l2nav');
      if (rail) { /* collapsed side nav: the tip sits to the right of the icon */
        tip.classList.add('replica-tooltip--right');
        tip.style.left = (r.right + 10) + 'px'; tip.style.top = (r.top + r.height / 2) + 'px';
      } else {
        tip.style.left = (r.left + r.width / 2) + 'px';
        var below = r.top < 44; tip.classList.toggle('replica-tooltip--below', below);
        tip.style.top = (below ? r.bottom : r.top) + 'px';
      }
      requestAnimationFrame(function () { requestAnimationFrame(function () { tip && tip.classList.add('is-in'); }); });
    } else if (!el && tip) {
      var gone = tip; tip = null; gone.classList.remove('is-in'); gone.classList.add('is-out');
      setTimeout(function () { gone.remove(); }, 160);
    }
  });
})();
