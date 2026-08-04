import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Lineage and Descent.
 *
 * One record per ancestor. It exists so that a line of descent can be walked
 * generation by generation, each step resting on a named document rather than on
 * family memory, and so that the register survives a reader who wants it to fail.
 *
 * It is built to make manufacture impossible. The fields that record nil returns,
 * conflicts, and evidence against interest are required, because a genealogy that
 * records only confirmations is not evidence — it is advocacy, and it is read as
 * advocacy. The negative findings are what make the positive ones believable.
 */

const lineage: RegistryDef = {
  slug: "lineage",
  title: "Register of Lineage and Descent",
  shortTitle: "Lineage & Descent",
  recordLabel: "Ancestor",
  recordLabelPlural: "Ancestors",
  group: "people",
  numberPrefix: "LIN",
  order: 7,
  authority:
    "Charter Art. VII §3 (Rolls). Research standard: Board for Certification of Genealogists, Genealogy Standards (2d ed. rev. 2021)",
  description:
    "One record per ancestor, holding every document that speaks to who that person was and how they were classified, so that descent can be proved step by step to a standard a hostile registrar cannot dismiss.",
  guidance: `**The unit of a claim is a family line, not an organisation.** Apex Kingdom was constituted in 2025, effective nunc pro tunc to 2010, and it cannot be acknowledged as an Indian tribe. That is not an inference drawn from the criteria; it is written into the regulation ahead of them. Under **25 C.F.R. § 83.4(a)** the Department will not acknowledge "an association, organization, corporation, or entity of any character formed in recent times unless the entity has only changed form by recently incorporating or otherwise formalizing its existing politically autonomous community" — and the saving clause reaches a body that merely put an existing community into legal form, not one that brought a community into being. The criteria at **§ 83.11** then require identification as an American Indian entity on a substantially continuous basis since 1900 (§ 83.11(a)); existence as a distinct community from 1900 until the present (§ 83.11(b)); political influence or authority over members as an autonomous entity from 1900 until the present (§ 83.11(c)); and descent from a historical Indian tribe (§ 83.11(e)). No register opened this decade supplies a century that did not happen. This register makes no attempt at it, and no record generated here may be offered to anyone as though it did.

What it does instead is provable: that particular people descended from particular people, each link resting on a document. Descent opens the routes that exist — enrolment in an existing tribe under that tribe's own law; Freedmen citizenship where a treaty right exists, the Cherokee Freedmen's having been confirmed in *Cherokee Nation v. Nash*, 267 F. Supp. 3d 86 (D.D.C. 2017), where the court held that Article 9 of the 1866 Treaty gives Freedmen descendants the same right to citizenship as native Cherokees for as long as native Cherokees have it; participation in a documented community's own recognition effort. Each asks the same first question, and this register is the answer.

*Nash* is a holding on one treaty and one nation, not a general rule about Freedmen, and it did not replace the documentary requirement with a status. The Cherokee Nation's own registration office asks for records that directly connect the applicant to a lineal ancestor listed on the Dawes Roll — which for a Black American family means the Freedmen schedules quite as much as the by-blood ones. The other Five Tribes have taken their own positions on their own 1866 treaties. Read each nation's law as it stands today; do not reason from *Nash* to a nation it did not decide.

**The benchmark is the Genealogical Proof Standard**, a real professional standard rather than a turn of phrase. The Board for Certification of Genealogists states five elements in *Genealogy Standards* (2d ed. rev., 2021): reasonably exhaustive research; complete and accurate source citations; thorough analysis and correlation; resolution of conflicting evidence; and a soundly written conclusion based on the strongest evidence. The Board certifies genealogists against those standards. It certifies nobody's conclusion, and there is no seal to be obtained for a particular line. The Standard matters because it is the yardstick a hostile reader applies whether or not they can name it.

What a failed attempt costs is worth stating precisely rather than dramatically. The one route where a single failure is formally final is a Part 83 group petition: under **§ 83.4(d)** an entity denied acknowledgment may not petition again except on the narrow conditions of §§ 83.47–83.49. A tribal enrolment application is not that. A denial on an evidentiary ground can ordinarily be answered with better evidence, which is why the enrolment field below asks for the reason in the tribe's own words — a refusal that names a missing document is an instruction. What a weak first submission does cost is the reader's assumption about everything that follows it, and no amount of refiling recovers that.

**Documented reclassification is the affirmative case. It is not a licence for thin evidence.** Walter Ashby Plecker was Virginia's first state registrar of vital statistics, from 1912 until his retirement in 1946. The Act to Preserve Racial Integrity of 1924 defined a white person as one with no trace of blood other than Caucasian, excepting persons with one-sixteenth or less American Indian blood and no other non-Caucasian blood — the provision commonly called the Pocahontas exception, which sheltered Virginians claiming descent from Pocahontas while the same statute was turned on people living as Indians. In administering it Plecker allowed two entries on vital records, white and coloured, set out to have Virginians who identified as Indian recorded as coloured, and in 1943 circulated to local registrars, clerks, and court officials a covering letter enclosing a list of the surnames of families he alleged were passing, the list generally reproduced under the title "Surnames, by Counties and Cities, of Mixed Negroid Virginia Families Striving to Pass as 'Indian' or White". Be careful with that document, because it is the one most likely to be quoted out of this register. Published accounts differ on the month of the covering letter and the Kingdom has not seen an original of either. Obtain the accession and item citation from the Library of Virginia and quote what they give you; do not state a month, and do not assert what collections reproduce it, until that has been done. The position is set out at \`docs/templates/ANCESTRY-RESEARCH-SOURCES.md\` § 4.2, which also lists what in this area has been verified and what has not.

When Congress recognised six Virginia tribes by statute in the **Thomasina E. Jordan Indian Tribes of Virginia Federal Recognition Act of 2017, Pub. L. No. 115-121**, approved 29 January 2018 — the Chickahominy Indian Tribe; the Chickahominy Indian Tribe—Eastern Division; the Upper Mattaponi Tribe; the Rappahannock Tribe, Inc.; the Monacan Indian Nation; and the Nansemond Indian Tribe, those being the names the statute uses — it did so because the administrative route under Part 83 runs on documents and those documents had been deliberately falsified. The erasure is conceded. It is the strongest precedent available and it is genuine.

Note what made it work: the tribes proved the falsification *with documents*. Plecker's own correspondence, the altered certificates, the census entries either side of the change. Reclassification is won by producing records, not by pointing at the space where records should be. Hence the classification log, the heart of this register: a person recorded "Indian" in 1900 and "Colored" in 1930 *is* the evidence, and that contradiction is worth more than either entry alone. Capture both, with the year, the document, the repository, and the hand that wrote it.

**Record what does not help, with the same care.** Two distinct things are wanted, and the field help below sets out both: a *negative finding* is a search that returned nothing, while *negative evidence* is the absence of something that ought to have been present, used affirmatively. Record each, labelled. The first is the adversary's opening question — what did you look at that did not help you — and having the answer already written is what makes everything else credible.

Conflicts are the same discipline. The fourth element of the Standard is *resolution* of conflicting evidence, not omission of it. Where a conflict cannot be resolved, write that down and leave the status at CONFLICTED. A disclosed conflict is a research problem; a discovered one is a credibility problem, and it takes the sound findings down with it. DISPROVEN and NOT_FOUND exist for the same reason: a register in which no line ever fails is a register nobody should believe, and recording the failures is what earns belief for the rest.

**What this register does not do.** Descent is not citizenship. A tribe determines its own membership under its own law — that is the core of tribal sovereignty, and in *Santa Clara Pueblo v. Martinez*, 436 U.S. 49 (1978), the Supreme Court held that the Indian Civil Rights Act creates no federal cause of action against a tribe over its membership ordinance. The Bureau of Indian Affairs states the same thing from the other direction on its genealogy guidance: "Tribal enrollment is determined and set by individual Tribes, not the Bureau of Indian Affairs; therefore, uniform membership requirements across all Tribes do not exist as criterion varies from Tribe to Tribe." Nothing here confers or compels enrolment; only a tribe can enrol. Nor does anything here make Apex Kingdom a tribe. It is offered as genealogy or it is not offered.

**Getting the records.** Most of this is a records-request exercise, so link each request; the principal federal holdings and their National Archives publication numbers sit against the record-set field below. Two companion documents carry what will not fit in a field. \`docs/templates/ANCESTRY-RESEARCH-SOURCES.md\` says where each record set is, what it contains, who holds it, how to ask, and — at its closing section — which of its own identifiers have been checked against the holding institution and which have not; nothing on that second list belongs in anything filed outside. \`docs/18-DESCENT-RECOGNITION-AND-CITIZENSHIP.md\` sets out what documented descent is worth once it exists, and the ways a claim of this kind is destroyed. One local point: Conn. Gen. Stat. § 7-51a opens birth records at least one hundred years old to any adult, and gives members of a genealogical society authorised in Connecticut full access to vital records held by a registrar, subject to stated exceptions. Joining one is the cheapest research decision available. Confirm the current text before relying on it.

**Classification and consent.** This register is SEALED and stays there. It holds data on living relatives who did not ask to be researched: kit numbers, matches' names, haplogroups, the family structure of people who are not members. Do not publish a living person's ancestry, name a match without written permission, or upload another person's results anywhere. Expect to find what nobody wanted — misattributed parentage, enslaved ancestors, enslaving ancestors, a line that simply ends. Record all of it; who gets told what is a decision for the family, not for the researcher.`,
  defaultClassification: "SEALED",
  defaultStatus: "RESEARCHING",
  restrictedTo: ["SOVEREIGN", "REGISTRAR", "COUNSEL"],
  titleField: "ancestorName",
  listColumns: ["generation", "birthDate", "deathDate", "claimedTribe"],

  statuses: [
    {
      value: "RESEARCHING",
      label: "Researching",
      tone: "active",
      help: "Open work. Sources are being identified and searched, and no conclusion should be quoted out of this record while it sits here.",
    },
    {
      value: "DOCUMENTED",
      label: "Documented",
      tone: "success",
      help: "Identity and the link to the next generation both rest on cited sources, the research is reasonably exhaustive, and any conflicts are resolved. This is the only status that should be relied on in anything sent outside.",
    },
    {
      value: "PARTIALLY_DOCUMENTED",
      label: "Partially documented",
      tone: "warning",
      help: "Some elements are proved and others rest on inference or on a single source. Say in the record which is which. A chain is only as strong as its weakest link, and this is where the weak link is declared.",
    },
    {
      value: "CONFLICTED",
      label: "Conflicting evidence unresolved",
      tone: "warning",
      help: "Sources contradict each other and the contradiction has not been resolved. Leave it here rather than picking the convenient reading. Resolution of conflicting evidence is the fourth element of the Genealogical Proof Standard and cannot be met by choosing.",
    },
    {
      value: "DISPROVEN",
      label: "Disproven",
      tone: "danger",
      help: "The evidence shows the claimed relationship or identification is wrong. Keep the record, keep the reasoning, and mark every downstream record that depended on it. A register in which no line ever fails is a register nobody should believe.",
    },
    {
      value: "NOT_FOUND",
      label: "Searched, not found",
      tone: "neutral",
      help: "The identified sources were searched and this person could not be located in them. This is a finding, not a blank. It is the answer to the adversary's first question, and recording it is what makes the rest of the file trustworthy.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral", help: "Replaced by a corrected record. Both stay in the chain so the earlier conclusion and the reason it changed remain visible." },
    { value: "VOID", label: "Void", tone: "danger" },
  ],

  fields: [
    // ---------------------------------------------------------------- Identity
    {
      key: "ancestorName",
      label: "Name of the ancestor",
      type: "text",
      required: true,
      summary: true,
      section: "Identity",
      help: "The fullest form of the name the documents support, with the surname spelled as it most commonly appears. Where the family knows the person by a different name from the records, use the record form here and put the family form in the variants field below.",
    },
    {
      key: "nameVariants",
      label: "Every name and spelling encountered",
      type: "textarea",
      section: "Identity",
      placeholder:
        "Sarah Bass — 1870 census, Nansemond Co. VA\nSary Bass — 1880 census, same household\nSarah Bass Weaver — 1885 marriage return\nS. Bass — 1866 Freedmen's Bureau labour contract",
      help: "One line per variant with the document it came from. This is not tidiness. Clerks and enumerators spelled phonetically, surnames shifted across a single generation, and a search that only tries the modern spelling will return nothing and be reported as a nil result. Many lines are lost here rather than in the archive.",
    },
    {
      key: "sex",
      label: "Sex as recorded",
      type: "select",
      section: "Identity",
      options: [
        { value: "FEMALE", label: "Female" },
        { value: "MALE", label: "Male" },
        { value: "UNRECORDED", label: "Not recorded in the sources" },
      ],
      help: "Recorded because it determines which genetic test can reach this ancestor at all: Y-DNA descends father to son, mitochondrial DNA passes from a mother to all her children but is transmitted onward only by daughters. An unbroken line of one or the other is what makes a direct-line test meaningful.",
    },
    {
      key: "birthDate",
      label: "Date of birth",
      type: "date",
      summary: true,
      section: "Identity",
      help: "Enter the best supported date. Where only a year or a range is known, enter the year with the first of January and say so in the confidence field — never let an estimate harden into a fact by being typed into a date box.",
    },
    {
      key: "birthPlace",
      label: "Place of birth",
      type: "text",
      section: "Identity",
      placeholder: "County, State, as it was named at the time",
      help: "Use the jurisdiction as it existed then, not as it is now. County boundaries moved constantly, and records follow the courthouse that held them at the time rather than the map today.",
    },
    {
      key: "birthConfidence",
      label: "Basis for the birth date and place",
      type: "select",
      section: "Identity",
      options: [
        { value: "DOCUMENTED", label: "Stated in a record made at or near the time", help: "A birth return, a family Bible entry made contemporaneously, a baptismal register." },
        { value: "DERIVED_FROM_AGE", label: "Calculated from an age given in a later record", help: "Ages in censuses were frequently guessed by an enumerator or given by a neighbour. Treat as a range, not a date." },
        { value: "RANGE_ESTIMATED", label: "Estimated from surrounding events", help: "Inferred from a marriage, a first child, a militia list. State the reasoning in the correlation field." },
        { value: "FAMILY_REPORT", label: "Family report only, no document", help: "Valuable as a lead and worthless as proof. It cannot support a link on its own." },
        { value: "UNKNOWN", label: "Unknown" },
      ],
      help: "Most nineteenth-century birth dates in American family trees are calculated from census ages and then presented as documented. That is the commonest way an otherwise sound file gets taken apart, because the moment one date is shown to be an estimate wearing a document's clothes, every other date in the file is re-read on the same assumption.",
    },
    {
      key: "deathDate",
      label: "Date of death",
      type: "date",
      summary: true,
      section: "Identity",
      help: "Record the basis in the source log alongside the date. A death certificate is an original record whose informant was often a grieving relative with second-hand knowledge — reliable for the death, much less so for the parents' names on it.",
    },
    {
      key: "deathPlace",
      label: "Place of death and burial",
      type: "text",
      section: "Identity",
      help: "Include the burial ground where known. Cemetery records, sexton's books, and stones frequently carry a relationship or a maiden name that appears in no other source.",
    },
    {
      key: "generation",
      label: "Generation from the Founder",
      type: "number",
      required: true,
      summary: true,
      min: 0,
      section: "Identity",
      help: "The Founder is 0, a parent is 1, a grandparent 2, and so on. This is what lets the chain be counted and audited: a claim that skips a generation is visible immediately as a gap in the numbering.",
    },
    {
      key: "relationshipPath",
      label: "Relationship path to the Founder",
      type: "text",
      section: "Identity",
      placeholder: "mother's mother's mother",
      help: "Spelled out rather than named, because the path is what determines which tests and which records apply. An unbroken mother's-mother path means mitochondrial DNA reaches this person; a path with one male link in it does not.",
    },
    {
      key: "descentThroughChild",
      label: "Child through whom descent runs",
      type: "recordRef",
      refRegistry: "lineage",
      section: "Identity",
      help: "The next record down the chain. Every ancestor except the Founder's own generation points at exactly one child, so the whole line can be walked without anyone reconstructing it from memory. If this is blank the record is an island and proves nothing about anybody.",
    },
    {
      key: "parentageEvidence",
      label: "What establishes this person as parent of that child",
      type: "textarea",
      section: "Identity",
      help: "The specific source or combination of sources that proves the link, not the fact that they appear in the same household. Living under one roof in a census is not proof of parentage — enumerators recorded relationships to the head of household, and only from 1880 onward. Name the deed, the will, the marriage return, the Bureau contract, or the correlation of several records that carries it.",
    },

    // -------------------------------------------- Classification as recorded
    {
      key: "classificationsRecorded",
      label: "Racial classifications recorded for this person",
      type: "multiselect",
      summary: true,
      section: "How they were classified",
      options: [
        { value: "WHITE", label: "White" },
        { value: "BLACK", label: "Black" },
        { value: "NEGRO", label: "Negro" },
        { value: "COLORED", label: "Colored" },
        { value: "MULATTO", label: "Mulatto", help: "Used inconsistently and by different rules in different census years. It records an enumerator's judgement of appearance, not an ancestry finding." },
        { value: "FREE_PERSON_OF_COLOUR", label: "Free person of colour" },
        { value: "INDIAN", label: "Indian" },
        { value: "FREE_ISSUE", label: "Free issue", help: "A term found chiefly in Virginia and North Carolina records for a person born free rather than manumitted. Regional usage varies; read it against the record it appears in." },
        { value: "OTHER_TERM", label: "Another term — set it out in full in the log" },
        { value: "NONE_RECORDED", label: "No classification recorded in that document", help: "Meaningful in itself. A record that ordinarily carries a racial designation and does not carry one here is a fact worth having." },
      ],
      help: "Tick every term that appears anywhere for this person, across every document. These are the words the records use. They are recorded because they were recorded — they describe an official's act of classification, never the person. Two or more ticks on one ancestor is the pattern this register exists to capture.",
    },
    {
      key: "classificationLog",
      label: "Classification log — one line per document",
      type: "textarea",
      required: true,
      section: "How they were classified",
      placeholder:
        "1900 | Indian | 12th Census, Nansemond Co. VA, ED 62, sheet 4A, dwelling 71 | enumerator J. T. Holland | informant not stated\n1910 | Mulatto | 13th Census, same county, ED 58, sheet 2B | enumerator unknown\n1930 | Colored | 15th Census, ED 65, sheet 9A | enumerator unknown\n1936 | Colored | VA death certificate no. 14872, Bureau of Vital Statistics | registrar's hand, classification overwritten",
      help: "This is the single most important field in the register. Give the year, the classification exactly as written, the document with its full citation, and the enumerator, registrar, clerk, or midwife who supplied it where known. A person recorded Indian in 1900 and Colored in 1930 IS the evidence of reclassification, and that contradiction is worth more than either entry standing alone. Never smooth the entries into agreement and never omit an inconvenient one: the disagreement is the finding.",
    },
    {
      key: "classificationChanged",
      label: "The classification recorded for this person changes across documents",
      type: "boolean",
      summary: true,
      section: "How they were classified",
      help: "Tick only where the log above actually shows it. This is an affirmative fact carrying real weight, which is exactly why it must never be asserted ahead of the documents that show it.",
    },
    {
      key: "reclassificationAnalysis",
      label: "Analysis of the change",
      type: "textarea",
      section: "How they were classified",
      help: "What changed, when, in whose hand, and what else was happening in that office at that date. Where an administrative campaign is being relied on, name it and cite it — the Virginia Act to Preserve Racial Integrity of 1924, Plecker's 1943 letter to local registrars and its enclosed list of surnames (cite it from the Library of Virginia's own accession, not from this register: the month of the covering letter is unconfirmed), a particular state's enumeration instructions, an agency's enrolment policy. Then check the timing honestly, because it is the first thing an opponent will check: a change dated before the policy it is attributed to needs a different explanation, and finding that yourself is much better than having it found. An unexplained change is a research question. A change tied to a documented policy, in the right order, is an argument.",
    },
    {
      key: "recordingOfficials",
      label: "Officials who recorded the classification",
      type: "textarea",
      section: "How they were classified",
      help: "Names of enumerators, registrars, clerks, and midwives across all the records for this family, and whether the same hand appears more than once. Pattern is what turns an individual entry into evidence of a practice, and the same official altering several families' records in one county is a far stronger fact than one altered certificate.",
    },

    // ------------------------------------------------------------- The sources
    {
      key: "recordSetsSearched",
      label: "Record sets searched",
      type: "multiselect",
      section: "The sources",
      options: [
        { value: "FEDERAL_CENSUS", label: "Federal population schedules" },
        { value: "INDIAN_POPULATION_SCHEDULE", label: "Special Indian population schedules, 1900 and 1910", help: "The 1900 schedule of special inquiries relating to Indians asked, in addition to the general questions, the tribe of the person and the tribe of the father and of the mother. Where an ancestor was enumerated on one it is among the strongest documentary evidence available. Enumerators were directed to use it for Indians on reservations and in family groups off them, so a dispersed eastern family will often not appear: absence here is not a finding that the family was not Indian, and must not be logged as one." },
        { value: "STATE_CENSUS", label: "State and territorial censuses" },
        { value: "INDIAN_CENSUS_ROLLS", label: "BIA Indian Census Rolls, 1885–1940", help: "NARA microfilm publication M595, 692 rolls, Record Group 75, compiled annually by agents and superintendents. The National Archives states that only persons who maintained a formal affiliation with a tribe under federal supervision are listed, and that non-Indian spouses in an Indian household are not. The consequence for an eastern family is the whole point: where no federal agency had jurisdiction over the community — which is the position understood to obtain in Virginia for this period, and which should be confirmed against the list of agencies in the M595 descriptive pamphlet before it is asserted anywhere — absence from these rolls proves nothing whatever. Record the reason alongside the nil return, because a bare negative here reads as a failed search rather than an inapplicable source." },
        { value: "DAWES", label: "Dawes Commission records, Five Tribes", help: "Record Groups 48 and 75. Enrolment ran from 1898 until the rolls closed in 1907, with a handful of persons added by act of Congress in 1914. The Final Rolls are NARA T529, the enrolment cards M1186 (Enrollment Cards for the Five Civilized Tribes, 1898–1914), and the application packets M1301 (Applications for Enrollment of the Commission to the Five Civilized Tribes, 1898–1914). Keep those packets distinct from the separate land allotment application jackets, 1899–1907, which were created only for people whose enrolment was approved — order the wrong series and an absent jacket reads as an absent family when what it means is a rejected application. Search every schedule, not only the by-blood ones — the Freedmen cards carry the fields naming the household that enslaved a person, and are frequently where a Black American family is actually found. The packet holds the testimony and the Commission's reasoning; the roll entry holds a name and a number." },
        { value: "GUION_MILLER", label: "Eastern Cherokee applications (Guion Miller)", help: "NARA microfilm publication M685, Records Relating to Enrollment of Eastern Cherokee by Guion Miller, 1908–1910, including the roll, testimony of witnesses, and earlier census rolls used in the determinations. Read the outcome, not merely the application: in his report of 28 May 1909 Miller recorded 45,847 applications covering some 90,000 claimants, of whom 30,254 were enrolled, the supplemental report of 5 January 1910 adding 610 names and striking 44 to give a final 30,820. Take the eligibility test and the figures from NARA's descriptive pamphlet for M685 rather than from its web page, which states both differently; the discrepancy and the reason for preferring the pamphlet are set out at `docs/templates/ANCESTRY-RESEARCH-SOURCES.md` § 1.3. An ancestor who applied is an ancestor who applied, and the rejected files say so in terms. Record which it was." },
        { value: "OTHER_TRIBAL_ROLL", label: "Another tribal roll or census", help: "Name it exactly in the search log. Rolls differ in purpose and in who they were allowed to include." },
        { value: "FREEDMENS_BUREAU", label: "Freedmen's Bureau records", help: "Record Group 105. Labour contracts, ration lists, marriage registers, and complaint books, often naming people who appear nowhere else." },
        { value: "STATE_VITAL_RECORDS", label: "State and town vital records" },
        { value: "CHURCH_REGISTERS", label: "Church and mission registers" },
        { value: "PROBATE", label: "Probate, wills, and estate files", help: "Estate inventories and distributions frequently name relationships no other record states, and name enslaved people by name." },
        { value: "DEEDS", label: "Deeds and land records" },
        { value: "TAX_LISTS", label: "Tax and tithable lists" },
        { value: "MILITARY", label: "Military service and pension files", help: "Pension files are exceptionally rich: applicants had to prove marriages, births, and identity to a sceptical examiner, often with sworn neighbour testimony." },
        { value: "SLAVE_SCHEDULES", label: "Slave schedules, 1850 and 1860" },
        { value: "FREE_REGISTERS", label: "Free negro and free person of colour registers", help: "Several southern states required free people of colour to register with a county court, and those registers record physical description, birth status, and sometimes parentage." },
        { value: "SCHOOL_RECORDS", label: "School and Indian boarding school records" },
        { value: "NEWSPAPERS", label: "Newspapers" },
        { value: "CEMETERY", label: "Cemetery, sexton, and monument records" },
        { value: "COURT_RECORDS", label: "Court records" },
        { value: "DNA_DATABASES", label: "Genetic genealogy databases" },
      ],
      help: "Tick a set only once it has actually been searched for this person, whatever it returned. The tick means searched, not consulted, and not intended.",
    },
    {
      key: "searchLog",
      label: "What each search returned",
      type: "textarea",
      required: true,
      section: "The sources",
      help: "One entry per search: the source with a full citation, the terms and spellings tried, the date searched, and what came back. Complete and accurate source citations are the second element of the Genealogical Proof Standard, and a citation that does not let a stranger retrieve the same page is not a citation. A finding whose source cannot be re-checked will be treated as unsourced, however true it is.",
    },
    {
      key: "nilReturns",
      label: "Searched and found nothing",
      type: "textarea",
      required: true,
      section: "The sources",
      placeholder:
        "1870 federal census, Southampton Co. VA — read line by line, no household of this surname. Searched 14 Mar 2026.\nBIA Indian Census Rolls M595, all Virginia agencies — no entry. Expected: no Virginia agency under federal supervision in the period.\nGuion Miller applications M685 — no application under any spelling tried.",
      help: "Mandatory, and it stays mandatory when the answer is long. An adversary's first question is what did you look at that did not help you, and having the answer already written is what makes everything else in the file credible. Distinguish two things: a negative FINDING is a search that returned nothing; NEGATIVE EVIDENCE is the absence of something that ought to have been present, used affirmatively — a man missing from every tax list in a county where all free men were taxed is evidence he was not living there. Record both, and label which is which.",
    },
    {
      key: "searchesOutstanding",
      label: "Identified but not yet searched",
      type: "textarea",
      required: true,
      section: "The sources",
      placeholder: "None outstanding as at [date] — the sources identified for this line have all been examined.",
      help: "Sources known to exist and not yet examined, with why. Required, because this is the field that keeps the first element of the Standard honest: research is reasonably exhaustive or it is not, and a record that lists what remains undone is far stronger than one that silently implies nothing does. Where the list really is empty, say so with the date, so that a blank never has to be read as either completeness or neglect.",
    },
    {
      key: "recordsRequest",
      label: "Records request obtaining these documents",
      type: "recordRef",
      refRegistry: "records-requests",
      section: "The sources",
      help: "Most of this work is a records-request exercise. Link the request so the statutory clocks are tracked where they are already tracked, and so a document that never arrived is visible as an outstanding request rather than as a gap in the research.",
    },

    // ------------------------------------------------------------ Quality
    {
      key: "keySourceType",
      label: "The link source — original, derivative, or authored",
      type: "select",
      section: "Evidence quality",
      options: [
        { value: "ORIGINAL", label: "Original record", help: "The first recording of the assertion — the register page, the certificate, the enumerator's sheet, or a photographic image of it." },
        { value: "DERIVATIVE", label: "Derivative record", help: "Transcribed, abstracted, indexed, or copied from something earlier. Every derivative introduces the possibility of a copying error, and indexes are the commonest source of confidently wrong names." },
        { value: "AUTHORED_NARRATIVE", label: "Authored narrative", help: "A county history, a published family genealogy, a website tree. A lead, never a proof. Go to what it cites, and where it cites nothing, treat it as an assertion by a stranger." },
        { value: "MIXED", label: "Several sources of differing type — set out in the analysis" },
      ],
      help: "These are the terms the Standard itself uses, and they are worth using exactly, because a reader who shares the vocabulary can go straight to assessing the evidence instead of first working out what is meant. This field describes the source on which the link to the child named above principally rests, not every source on the record; classify the rest in the search log.",
    },
    {
      key: "keyInformationType",
      label: "The information within it — primary or secondary",
      type: "select",
      section: "Evidence quality",
      options: [
        { value: "PRIMARY", label: "Primary information", help: "Supplied by someone with first-hand knowledge of the event, reporting at or near the time." },
        { value: "SECONDARY", label: "Secondary information", help: "Supplied by someone reporting what they were told or what they believed. Most parentage on a death certificate is secondary." },
        { value: "UNDETERMINED", label: "Undetermined", help: "The informant is not named and cannot be inferred. Common and worth stating plainly." },
        { value: "MIXED", label: "Mixed within the one document" },
      ],
      help: "A single document can be original and still carry secondary information, and the two questions are separate. A death certificate is an original record; the deceased's parents' names on it were given by a grieving relative who may never have met them. Judging the document by its form alone is how a whole line gets built on a guess.",
    },
    {
      key: "keyEvidenceType",
      label: "The evidence it provides — direct, indirect, or negative",
      type: "select",
      section: "Evidence quality",
      options: [
        { value: "DIRECT", label: "Direct evidence", help: "A statement that answers the question on its own: this record says X is the son of Y." },
        { value: "INDIRECT", label: "Indirect evidence", help: "Two or more items which each answer something else but together support the conclusion. A well-built indirect case can be stronger than a single direct statement, and it must be written out to be worth anything." },
        { value: "NEGATIVE", label: "Negative evidence", help: "The absence of something that should be present, used affirmatively. It must be layered with other evidence; it never carries a conclusion alone." },
        { value: "MIXED", label: "A combination — set out in the analysis" },
      ],
      help: "Direct, indirect, and negative describe what the evidence does, not how good it is. Much of the strongest work on Black and Native families before 1870 is necessarily indirect, because the records that would have stated the relationship directly were never made or were made to say something else.",
    },
    {
      key: "evidenceCorrelation",
      label: "Analysis and correlation",
      type: "textarea",
      section: "Evidence quality",
      help: "The reasoning, written out: what each source says, how they fit together, what the alternative readings are, and why this reading is the strongest. This is the third and fifth elements of the Standard, and it is what a reader actually evaluates. A tree with sources attached and no reasoning is a set of claims; a written conclusion is a proof.",
    },

    // ----------------------------------------------------------- Conflicts
    {
      key: "conflictStatus",
      label: "State of conflicting evidence",
      type: "select",
      required: true,
      section: "Conflicts",
      options: [
        { value: "NONE_IDENTIFIED", label: "None identified in the searches recorded above" },
        { value: "RESOLVED", label: "Identified and resolved" },
        { value: "PARTIALLY_RESOLVED", label: "Partially resolved" },
        { value: "UNRESOLVED", label: "Identified and unresolved", help: "A legitimate and honourable answer. Set the record status to CONFLICTED and leave it there until the evidence changes." },
      ],
      help: "None identified is a statement about the searches actually done, not a statement that no conflict exists. Say it that way.",
    },
    {
      key: "conflictingEvidence",
      label: "Evidence contradicting the claimed line",
      type: "textarea",
      required: true,
      section: "Conflicts",
      placeholder: "None identified as at [date], on the searches listed above.",
      help: "Every source that cuts against the conclusion, set out in full with its citation. Where nothing has been found, write that, with the date. This field is required because a genealogy recording only what helps is not evidence but advocacy, and a reader who cannot see the contrary sources has no way to tell which of the two this is.",
    },
    {
      key: "conflictResolution",
      label: "How each conflict was resolved, or why it was not",
      type: "textarea",
      required: true,
      section: "Conflicts",
      placeholder: "No conflict identified as at [date] requiring resolution.",
      help: "Resolution of conflicting evidence is the fourth element of the Standard, and it means explaining why the rejected source is wrong — a known copying error, an informant without knowledge, an index misreading, a different person of the same name. Choosing the helpful source and dropping the other is not resolution. It is the thing the Standard exists to prevent, and an opponent who finds the dropped source has found the whole file's character in one document.",
    },
    {
      key: "evidenceAgainstInterest",
      label: "Findings against interest",
      type: "textarea",
      required: true,
      section: "Conflicts",
      placeholder: "None found as at [date], on the searches listed above.",
      help: "Anything discovered that weakens or complicates the claim, recorded whether or not anyone asks: a rejected application, an ancestor recorded as white throughout, a roll the family is plainly absent from, a competing candidate of the same name, a line that runs out. Required, and required with a dated nil answer where there is nothing to record, so that an empty field can never mean the question was not asked. Material against interest is the strongest signal of good faith a compiled genealogy can send, and it is the reason the confirmations elsewhere in the file get believed.",
    },
    {
      key: "downstreamImpact",
      label: "Records affected if this conclusion falls",
      type: "textarea",
      section: "Conflicts",
      placeholder:
        "LIN-000014 (child) — parentage rests wholly on this link.\nLIN-000009 (grandchild) — generation numbering shifts by one if this is withdrawn.\nCIT-000003 — descent statement in the citizen's file quotes this record.",
      help: "Which other records depend on this one being right, listed by number. A conclusion is not withdrawn by deleting it; it is withdrawn by finding everything that was built on it. Fill this in when the record is made, not when it fails, because at the moment a link is disproven the person best placed to know what rested on it is usually the person least willing to go looking. Where this record is set to DISPROVEN or SUPERSEDED, work this list and note what was done to each entry on it.",
    },

    // ---------------------------------------------------------------- DNA
    {
      key: "dnaTestTypes",
      label: "Genetic tests bearing on this ancestor",
      type: "multiselect",
      section: "Genetic evidence",
      options: [
        { value: "AUTOSOMAL", label: "Autosomal", help: "Tests the twenty-two non-sex chromosomes. Useful for finding relatives within roughly five to seven generations and progressively less so beyond that, because inheritance is a lottery run afresh each generation and a descendant may carry none of a given distant ancestor's DNA at all. This is why a low or absent result cannot disprove a documented ancestor, and equally why a result cannot supply one." },
        { value: "MTDNA", label: "Mitochondrial (mtDNA)", help: "Follows the direct maternal line only — mother's mother's mother, without limit of generations. Its power is asymmetric and the asymmetry must be respected in what is written down. A mismatch excludes a hypothesised maternal line and does so decisively. A match does not prove the hypothesised line: mtDNA mutates slowly, so identical sequences are shared by people whose common maternal ancestor lived far beyond any record, and a match is evidence consistent with the line rather than evidence of it." },
        { value: "Y_DNA", label: "Y-chromosome (Y-DNA)", help: "Follows the direct paternal line only, father to son. It follows the biological line, not the surname, and the two part company more often than families expect. The same asymmetry applies as for mtDNA, though high-resolution marker testing narrows a match considerably: state the number of markers or the sequencing level, because a match at low resolution and a match at high resolution are different findings and only one of them is worth much." },
        { value: "NONE", label: "No test bears on this ancestor" },
      ],
      help: "Record only tests that can actually reach this person along the relationship path recorded above. An autosomal test says nothing specific about a seventh-generation ancestor, and an mtDNA test says nothing at all about anyone off the direct maternal line.",
    },
    {
      key: "testingCompany",
      label: "Testing company and database",
      type: "text",
      section: "Genetic evidence",
      help: "Companies use different reference panels and different match thresholds, so a result is only interpretable against the panel that produced it. Record where the test was taken and where the results have been uploaded, because uploads change who can see them.",
    },
    {
      key: "kitReference",
      label: "Kit reference",
      type: "text",
      section: "Genetic evidence",
      classification: "SEALED",
      help: "The kit identifier and whose sample it is. This identifies a living person and their biological relatives. Never publish it, never include it in anything filed or sent outside, and do not upload another person's results to any database without their specific written permission.",
    },
    {
      key: "haplogroup",
      label: "Haplogroup",
      type: "text",
      section: "Genetic evidence",
      help: "The mtDNA or Y-DNA haplogroup with the testing level that produced it, recorded to the fullest branch the test resolved. Haplogroups describe deep ancestral populations over thousands of years, and the branch is what carries the meaning, not the letter: the founding American maternal lineages are particular subclades, and other branches of the same parent haplogroups are Asian, European, or Near Eastern. A low-resolution result reported as a bare letter therefore settles nothing, and has been read as proof of indigenous descent more than once by people who were wrong. Even at full resolution an American subclade indicates an indigenous direct maternal or paternal line and nothing narrower — it does not identify a tribe, a nation, or a community, and it cannot be made to.",
    },
    {
      key: "relevantMatches",
      label: "Relevant matches",
      type: "textarea",
      section: "Genetic evidence",
      classification: "SEALED",
      help: "Matches that bear on this line: the relationship indicated, the shared quantity, and — critically — whether the match's own documented descent is known. A match to a person whose paper trail to a documented family is proved is worth far more than a hundred matches with unsourced trees. Note the limit that trips people up: a match establishes that two people share ancestry, not which ancestor they share it through. Where the families intermarried more than once, or the community was small and endogamous, the shared segment may come from a couple entirely different from the one being argued for, and saying so in the record is what stops the match being quoted later as proof of a link it never spoke to. Do not record a living match's name without their permission.",
    },
    {
      key: "dnaInterpretation",
      label: "What the genetic evidence does and does not show",
      type: "textarea",
      section: "Genetic evidence",
      help: "Be exact, because this is where claims of this kind most often fail in public. An autosomal admixture percentage is an estimate produced by comparing a sample against a reference panel; the panels differ between companies, indigenous American reference data is thin, and the same sample returns different figures from different providers. The Bureau of Indian Affairs states the position in its own genealogy guidance: \"Blood tests and DNA tests will not help an individual document his or her descent from a specific Federally recognized tribe or tribal community.\" That sentence will be quoted at this file, so it should already be in it. It cuts both ways and the second edge is the useful one: because a percentage cannot establish a particular tribe, a low or absent percentage cannot refute a documented ancestor five or six generations back either. What genetic evidence can do is real: mtDNA and Y-DNA exclude a hypothesised direct maternal or paternal line outright where they do not match, and support one where they do, across many generations; and a match to a relative whose descent from a documented family is independently proved can be decisive on a link the paper record cannot carry alone. Exclusion is the sharper of the two edges and the one to reach for first, because it settles a question rather than adding weight to it. Use testing above all to find the living people who hold documents. Say which of these the result is, and never present admixture as ancestry.",
    },

    // ------------------------------------------------------- Tribal connection
    {
      key: "claimedTribe",
      label: "Historical tribe or community claimed",
      type: "text",
      summary: true,
      section: "Tribal connection",
      help: "The specific historical tribe or community, named as it is named in the records of the period, not a regional or linguistic grouping. The specificity is the point: 25 C.F.R. § 83.11(e) requires descent from a historical Indian tribe rather than from Indians generally, and a tribal enrolment office asks the same question in narrower terms still, since it is looking for its own people and not for Native ancestry at large. Leave it blank where the honest answer is that no particular community has been identified. A blank here is a research position; a guess here is a mistake that gets quoted back.",
    },
    {
      key: "claimBasis",
      label: "Basis of the claimed connection",
      type: "select",
      section: "Tribal connection",
      options: [
        { value: "ROLL_ENTRY", label: "Entry on a tribal roll or census", help: "The strongest basis available, and the one most tribal enrolment offices are actually built around. Record the roll and number below." },
        { value: "DOCUMENTARY_RECORD", label: "Contemporary documentary record", help: "A census classification, agency correspondence, a church or school register, a court record naming the community. Corresponds to the official-records and enrolment-records categories at 25 C.F.R. § 83.11(e)(2)(i)–(ii)." },
        { value: "SCHOLARLY_RECORD", label: "Record created by a historian or anthropologist at the time", help: "\"Records created by historians and anthropologists in historical times\" is named at 25 C.F.R. § 83.11(e)(2)(iii). Note the words \"in historical times\": a modern scholar's opinion about a family is not this category. Cite the work and the page." },
        { value: "COMMUNITY_AFFIRMATION", label: "Affirmation by tribal elders or a tribal governing body", help: "Named at § 83.11(e)(2)(iv), which requires personal knowledge — an affidavit from someone who knows the facts, not a letter of goodwill." },
        { value: "FAMILY_TRADITION_ONLY", label: "Family tradition only", help: "A lead, and often a good one; several documented lines began here. It is not descent and will not be received as descent. Keep it in this field, work it into documents, and leave the record at RESEARCHING until they arrive." },
        { value: "DNA_ONLY", label: "Genetic result only", help: "Cannot establish a connection to a particular community — the BIA says so expressly, quoted in the genetic evidence section. This basis alone supports no conclusion." },
        { value: "GEOGRAPHIC_INFERENCE", label: "Inference from place of residence", help: "That a family lived where a tribe lived is not evidence they belonged to it. State it as the weak inference it is." },
        { value: "NONE_IDENTIFIED", label: "None identified" },
      ],
      help: "Choose the strongest basis actually held, not the strongest hoped for. Every one of these is honest; only some of them are proof, and the record must show which this is. Two things about the regulation cited in these options, so nothing here is read as more than it is. First, § 83.11(e) sets out how a *group petitioning for acknowledgment* shows that its members descend from a historical tribe; it confers nothing on an individual and creates no route this family can walk. It is used here as a yardstick because it is the most exacting published statement of what counts as evidence of descent, and a basis that would satisfy it will satisfy an enrolment office. Second, the evidence categories at § 83.11(e)(2) apply only where no tribal roll was directed by Congress or prepared by the Secretary; where such a roll exists, § 83.11(e)(1) makes descent from it the route, which is the same answer a tribal enrolment office gives.",
    },
    {
      key: "claimBasisDetail",
      label: "The basis set out with citations",
      type: "textarea",
      section: "Tribal connection",
      help: "What the source says, in its words, with the citation. Where the connection is inferred rather than stated, say which sources are being combined and why the inference is sound. An inference written out can be assessed; an inference presented as a fact will be assessed anyway, less kindly.",
    },
    {
      key: "appearsOnRoll",
      label: "Appears on a tribal roll",
      type: "select",
      section: "Tribal connection",
      options: [
        { value: "YES", label: "Yes — roll and number recorded below" },
        { value: "SEARCHED_NOT_FOUND", label: "Searched, not found", help: "Record which rolls, in the nil returns field. Absence is often explicable — many rolls covered only people under a particular agency, or closed on a particular date — and the explanation is part of the finding." },
        { value: "NOT_SEARCHED", label: "Not yet searched" },
        { value: "NO_RELEVANT_ROLL", label: "No relevant roll exists for this community and period", help: "True for a great many communities, including several that are federally recognised today. Say so plainly rather than leaving it looking unsearched." },
      ],
    },
    {
      key: "rollName",
      label: "Roll name, date, and entry",
      type: "text",
      section: "Tribal connection",
      placeholder: "e.g. BIA Indian Census Rolls (NARA M595), [agency], [year], line [n]",
      help: "The roll's actual name, the year, and where it is held. Confirm the exact title and any NARA publication number against archives.gov before citing it anywhere outside this system, because a roll cited under a name it does not have cannot be retrieved by the person checking it, and an entry nobody can retrieve is treated as an entry nobody has seen.",
    },
    {
      key: "rollNumber",
      label: "Roll or enrolment number",
      type: "text",
      section: "Tribal connection",
      help: "The number as printed, transcribed exactly, including any prefix. Where a card or application number differs from the final roll number, record both — they are routinely confused and they retrieve different files.",
    },
    {
      key: "descendantEnrollmentStatus",
      label: "Enrolment status of any descendant",
      type: "select",
      section: "Tribal connection",
      options: [
        { value: "NONE", label: "No descendant has applied" },
        { value: "INQUIRY_MADE", label: "Inquiry made to the tribe" },
        { value: "APPLICATION_PENDING", label: "Application pending" },
        { value: "ENROLLED", label: "A descendant is enrolled", help: "The strongest fact this register can hold. Record the tribe, the person, and the date." },
        { value: "DENIED", label: "Application denied", help: "Record the reason given, in the tribe's words. A denial on a specific evidentiary ground is a research instruction; a denial on a criterion the family cannot meet is an answer, and both are worth having in writing." },
        { value: "NOT_APPLICABLE", label: "Not applicable" },
      ],
      help: "Enrolment is granted by a tribe under its own law and by nobody else — the BIA's own guidance says enrolment is determined and set by individual tribes and that requirements vary from tribe to tribe. Nothing in this register creates a right to it, and no document generated here should be sent to a tribe as though it did. What this file offers an enrolment office is sourced genealogy in a form they can check, which is the only thing they have asked for.",
    },
    {
      key: "enrolmentNotes",
      label: "Correspondence and requirements",
      type: "textarea",
      section: "Tribal connection",
      help: "What the tribe's own enrolment ordinance requires, where it has been read, and what any correspondence said. Requirements differ enormously between tribes — lineal descent from a specific roll, a blood quantum, residence, a closed roll — and are set by that tribe alone. Read the ordinance before making an application, and record where it was obtained.",
    },

    // ------------------------------------------------- Cross-references, consent
    {
      key: "relatedCitizen",
      label: "Living member this line runs to",
      type: "recordRef",
      refRegistry: "citizens",
      section: "Cross-references and consent",
      help: "The Kingdom citizen whose descent this record supports. Keeps the lineage work tied to a real person's file rather than floating as an unattached tree. Citizenship of the Kingdom is a different thing from tribal enrolment and carries none of its consequences; the link here records who the research is for, and nothing more.",
    },
    {
      key: "relatedVitalRecord",
      label: "Related vital or sacramental record",
      type: "recordRef",
      refRegistry: "vital-records",
      section: "Cross-references and consent",
      help: "Where the Kingdom's own register carries a rite touching this line. Note the distinction that matters: an ecclesiastical record proves the rite, not the civil fact, and it is offered here as one source among others.",
    },
    {
      key: "documentImages",
      label: "Document images in the Evidence Vault",
      type: "recordRef",
      refRegistry: "evidence",
      section: "Cross-references and consent",
      help: "The underlying images, logged with their custody record. Images held only in a subscription genealogy account are images the Kingdom will lose when the subscription lapses, and a citation to a page nobody can retrieve is not a citation.",
    },
    {
      key: "researcher",
      label: "Researcher",
      type: "person",
      section: "Cross-references and consent",
      help: "The named individual who did the work and who can answer for it. One human being, not an office and not a website.",
    },
    {
      key: "researchOpenedDate",
      label: "Date research opened",
      type: "date",
      section: "Cross-references and consent",
      help: "When work on this ancestor began. The deadline rules run from here, and it also fixes the point from which the searches recorded above should be read.",
    },
    {
      key: "lastReviewedDate",
      label: "Date last reviewed",
      type: "date",
      section: "Cross-references and consent",
      help: "Update whenever the record is revisited. Archives digitise and index continuously, and a search that returned nothing three years ago is not a search that returns nothing today.",
    },
    {
      key: "livingRelativesConsent",
      label: "Living relatives named here have consented to being recorded",
      type: "boolean",
      section: "Cross-references and consent",
      help: "Unticked is not a bar to keeping the record; it is a bar to sharing it. Genealogy is the one research discipline whose subjects mostly did not volunteer, and the living people in a family tree include some who would rather not be found.",
    },
    {
      key: "sensitivityNotes",
      label: "Sensitivity and disclosure notes",
      type: "textarea",
      classification: "SEALED",
      section: "Cross-references and consent",
      help: "Anything in this line that would harm or distress a living person if it circulated: misattributed parentage, an adoption never disclosed, enslaved ancestors named in an estate inventory, an ancestor who held people as property, a relative who has asked not to be included. Record the fact and record separately who has been told. What the register knows and what the family discusses are two different decisions, and only the second belongs to the researcher's discretion.",
    },
  ],

  deadlineRules: [
    {
      id: "lin-nil-returns-outstanding",
      title: "No record of what was searched without result",
      fromField: "researchOpenedDate",
      offsetDays: 60,
      severity: "HIGH",
      authority: "Genealogical Proof Standard, element 1 (reasonably exhaustive research)",
      detail:
        "Sixty days of research with no negative-search record. Write it now, while it can still be remembered accurately. Reconstructed later it is a guess, and the first question any sceptical reader asks is what was looked at that did not help — a file that cannot answer is treated as a file that did not look.",
      when: (data) => !data.nilReturns,
    },
    {
      id: "lin-citations-outstanding",
      title: "Findings recorded without a search log",
      fromField: "researchOpenedDate",
      offsetDays: 30,
      severity: "HIGH",
      authority: "Genealogical Proof Standard, element 2 (complete and accurate source citations)",
      detail:
        "Conclusions are accumulating with no source log behind them. Cite as you go: a citation written at the time takes two minutes, and one reconstructed from memory a year later is frequently wrong in exactly the way that gets noticed. An uncited finding will be treated as unsourced no matter how sound it is.",
      when: (data) => !data.searchLog,
    },
    {
      id: "lin-conflict-unresolved",
      title: "Conflicting evidence has sat unresolved",
      fromField: "researchOpenedDate",
      offsetDays: 180,
      severity: "HIGH",
      authority: "Genealogical Proof Standard, element 4 (resolution of conflicting evidence)",
      detail:
        "Either resolve the conflict by explaining why the rejected source is wrong, or record expressly that it cannot presently be resolved and leave the status at CONFLICTED. What must not happen is the conflict quietly disappearing from the file. An unresolved conflict disclosed is a research problem; the same conflict discovered by someone else is a credibility problem, and it takes the sound findings down with it.",
      when: (data) => data.conflictStatus === "UNRESOLVED",
    },
    {
      id: "lin-no-findings-against-interest",
      title: "No findings against interest recorded",
      fromField: "researchOpenedDate",
      offsetDays: 90,
      severity: "HIGH",
      authority: "Genealogy Standards, 2d ed. rev. (2021), element 3 (analysis and correlation)",
      detail:
        "Ninety days of work on a line with nothing recorded that cuts against it. Occasionally that is the truth and it should be written down as such, with the date. More often it means the contrary material was seen and not entered, and a file of that shape is identifiable from outside: every ancestor confirmed, no rejected application, no ambiguous entry, no line that failed. The confirmations in such a file are discounted wholesale, including the ones that were sound.",
      when: (data) => !data.evidenceAgainstInterest,
    },
    {
      id: "lin-reclassification-asserted-without-analysis",
      title: "Reclassification ticked without the analysis behind it",
      fromField: "researchOpenedDate",
      offsetDays: 30,
      severity: "HIGH",
      detail:
        "The record asserts that the classification changed across documents but carries no analysis of the change, and in some cases no classification log to show it. This is the register's central affirmative fact and the one most closely read. Set out the entries either side of the change, the hand that made each, and the policy relied on — or untick the box until that work is done. An assertion of reclassification that the file cannot itself demonstrate does more damage than silence, because it invites the reader to test it and hands them the answer.",
      when: (data) =>
        data.classificationChanged === true &&
        (!data.reclassificationAnalysis || !data.classificationLog),
    },
    {
      id: "lin-link-without-parentage-evidence",
      title: "A generational link asserted without evidence of parentage",
      fromField: "researchOpenedDate",
      offsetDays: 45,
      severity: "HIGH",
      detail:
        "This record names the child through whom descent runs but does not say what proves the relationship. The chain is walked link by link by anyone assessing it, and an unevidenced link stops the walk at that generation regardless of how well documented the ancestors above it are. Name the deed, the will, the marriage return, the pension file, or the correlation that carries it — or record that the link is presently inferred and set the status to PARTIALLY_DOCUMENTED.",
      when: (data) => Boolean(data.descentThroughChild) && !data.parentageEvidence,
    },
    {
      id: "lin-unevidenced-tribal-claim",
      title: "Tribal connection rests on tradition or a genetic result alone",
      fromField: "researchOpenedDate",
      offsetDays: 90,
      severity: "HIGH",
      authority: "25 C.F.R. § 83.11(e); BIA guidance on tracing American Indian ancestry",
      detail:
        "A connection resting only on family tradition or on a commercial test will not be received as evidence by a tribe or an agency; the BIA states that blood and DNA tests will not help an individual document descent from a specific federally recognised tribe. Either find the documents or leave this record at RESEARCHING with the connection recorded as unproved. The risk is not the weak basis itself, which is a normal starting point — it is a weak basis that quietly stops being labelled as one and is later quoted as a finding.",
      when: (data) =>
        data.claimBasis === "FAMILY_TRADITION_ONLY" || data.claimBasis === "DNA_ONLY",
    },
    {
      id: "lin-annual-review",
      title: "Annual review of an ancestor record",
      fromField: "lastReviewedDate",
      offsetDays: 365,
      severity: "ROUTINE",
      detail:
        "Kingdom practice, not any external requirement. Archives digitise and re-index continuously, and material that was unfindable last year is routinely findable now — particularly for families whose records were misfiled under an imposed classification. Re-run the searches that returned nothing, check whether the outstanding list can be shortened, and update the review date whatever the result.",
    },
  ],
};

export default lineage;
