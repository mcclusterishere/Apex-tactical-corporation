import type { RegistryDef } from "@/registries/types";

/**
 * The Register of Member Accounts.
 *
 * A closed internal account showing what a member has given, what the Kingdom
 * owes them, and what they owe it. Kept because a member who cannot see their
 * own contribution record has no way to detect an error in it, and because the
 * substantiation letters the tax code requires are built from the same data.
 *
 * The line this register must never cross is stated on every screen: the
 * Kingdom holds its own money. Holding one person's money to pay another is
 * money transmission, which is licensed activity and a federal felony without
 * a licence. This register does not implement transfers between members.
 */

const memberAccounts: RegistryDef = {
  slug: "member-accounts",
  title: "Register of Member Accounts",
  shortTitle: "Member Accounts",
  recordLabel: "Account",
  recordLabelPlural: "Accounts",
  group: "treasury",
  numberPrefix: "MAC",
  order: 3,
  authority:
    "Charter Art. IV §7 (Economic Powers); 26 U.S.C. §§ 170(f)(8), 6001; 31 C.F.R. § 1010.100(ff)",
  description:
    "One account per member recording what they have contributed, what the Kingdom owes them, and what they owe it — book-keeping, and nothing that moves money between members.",
  guidance: `**What this register is.** A ledger account per member showing three things: the cumulative record of what they have given, amounts the Kingdom owes them (reimbursements under an accountable plan, stipends, a restricted gift held on their instruction), and amounts they owe it (dues, an unpaid pledge). That is accounts receivable and accounts payable — ordinary book-keeping, required of any institution whose books must survive examination under 26 U.S.C. § 6001.

**What it is not, and must never become.** Receiving money from one person in order to transmit it to another is money transmission — 31 C.F.R. § 1010.100(ff)(5) defines the money transmitter by exactly that function. Conducting it without a licence is a federal felony under **18 U.S.C. § 1960**, which requires no proof that the operator knew a licence was needed. It carries FinCEN registration as a money services business under **31 C.F.R. § 1022.380** within 180 days, and Connecticut licensure under the Money Transmission Act, **Conn. Gen. Stat. § 36a-595 et seq.**

The distinction is not subtle and is worth stating in concrete terms:

- Recording that a member's pledge has been paid in full: **book-keeping.**
- Reimbursing a member for chairs they bought for the hall, against a receipt: **book-keeping.** The Kingdom is paying its own debt to its own member.
- Holding a member's money and paying their landlord when they ask: **money transmission.** The money is theirs, the payee is a third party, and the Kingdom is the conduit.
- Letting one member move a balance to another member's account: **money transmission**, and depending on structure also the taking of deposits, which is banking and requires a charter under Conn. Gen. Stat. Title 36a.
- Collecting funds from members to forward to a relief organisation abroad: **money transmission**, and potentially a sanctions matter as well.

**This register implements no transfers between members and no payments to third parties on a member's instruction.** If such a facility is ever wanted, it is a licensing decision to be taken with counsel and a compliance budget, not a feature request to be built. Say so to any member who asks for it, once, plainly.

**Interest is the other trap.** A balance the Kingdom holds for a member and on which it pays a return is not an account; it is a demand note, which is a security and belongs in the Register of Obligations under counsel review. Member accounts bear no interest. If someone proposes that they should, that proposal moves registers.

**Members get statements, always.** A member who cannot see their own record cannot detect an error in it, and the errors are real — a gift posted to the wrong account, a cheque credited twice, a pledge marked unpaid that was in fact paid in cash. Statements are the only mechanism by which the Kingdom finds those before an auditor or a resentful former member does. They also protect the Treasurer: an account confirmed by the holder each quarter is an account nobody can later claim was manipulated.

The same data produces the contemporaneous written acknowledgments required by **26 U.S.C. § 170(f)(8)** for any single gift of 250 dollars or more. The donor may claim no deduction without one, and it must be in their hands by the earlier of the date they file or the due date of the return — so the annual statement goes out in January, not in April. Keep the two distinct: the statement reports the account; the acknowledgment makes the statutory representation about goods and services received.`,
  defaultClassification: "SEALED",
  defaultStatus: "OPEN",
  restrictedTo: ["SOVEREIGN", "TREASURER"],
  titleField: "accountHolderName",
  listColumns: ["accountPurpose", "balanceBasis", "currentBalance", "lastStatementDate"],

  statuses: [
    {
      value: "OPEN",
      label: "Open",
      tone: "active",
      help: "Live and receiving entries. Statements are due on the stated frequency.",
    },
    {
      value: "DORMANT",
      label: "Dormant",
      tone: "warning",
      help: "No activity for a prolonged period. Do not simply absorb a dormant credit balance — money owed to a member remains owed, and unclaimed property law may require it to be escheated to the State of Connecticut rather than kept.",
    },
    {
      value: "IN_DISPUTE",
      label: "In dispute",
      tone: "warning",
      help: "The holder has queried an entry. Resolve in writing and keep both the query and the answer. Never quietly amend a disputed figure.",
    },
    {
      value: "IN_ARREARS",
      label: "In arrears",
      tone: "warning",
      help: "The holder owes the Kingdom. Nothing about an arrears balance may condition membership, exit, or the return of a member's own property — Charter Art. II guarantees free withdrawal without penalty, and that provision outranks any sum on this form.",
    },
    {
      value: "CLOSED",
      label: "Closed",
      tone: "neutral",
      help: "Settled and closed. Record how any residual balance was treated and keep the record; a closed account is still a record of gifts a donor may need years later.",
    },
    { value: "SUPERSEDED", label: "Superseded", tone: "neutral" },
    {
      value: "VOID",
      label: "Void",
      tone: "danger",
      help: "Opened in error or duplicated. Voiding an account does not erase the entries posted to it; re-post them to the correct account and cross-reference both.",
    },
  ],

  fields: [
    {
      key: "accountHolderName",
      label: "Account holder",
      type: "text",
      required: true,
      section: "Account holder",
      summary: true,
      help: "Full legal name as it will appear on statements and on any substantiation letter. A letter under 26 U.S.C. § 170(f)(8) naming the wrong person is of no use to the donor.",
    },
    {
      key: "accountHolder",
      label: "Roll of Citizens record",
      type: "recordRef",
      refRegistry: "citizens",
      section: "Account holder",
      help: "Link to the member's entry on the Roll. Linking rather than retyping is what keeps one person from acquiring three accounts under three spellings of their name.",
    },
    {
      key: "holderIsOfficer",
      label: "Holder holds office in the Kingdom",
      type: "boolean",
      section: "Account holder",
      help: "Officer accounts require a second pair of eyes on every entry. A payable to an officer approved by that same officer is the fact pattern that produces an excess benefit finding under 26 U.S.C. § 4958.",
    },

    {
      key: "accountPurpose",
      label: "Purpose of the account",
      type: "select",
      required: true,
      section: "The account",
      summary: true,
      help: "What the account records. Open a separate account for each purpose rather than one account doing several jobs — a mixed account cannot be reconciled and cannot be explained.",
      options: [
        {
          value: "CONTRIBUTION_HISTORY",
          label: "Contribution history",
          help: "A cumulative record of gifts made. It is a history, not a balance: the money belongs to the Kingdom the moment it is given, and the member has no claim on it.",
        },
        {
          value: "REIMBURSEMENT_PAYABLE",
          label: "Reimbursement payable",
          help: "Expenses the member paid on the Kingdom's behalf. Reimburse only under an accountable plan — business connection, substantiation within a reasonable period, and return of any excess — or the payment becomes taxable wages.",
        },
        { value: "DUES_RECEIVABLE", label: "Dues receivable" },
        {
          value: "PLEDGE_RECEIVABLE",
          label: "Pledge receivable",
          help: "A promise to give that has not been fulfilled. Not income, and never acknowledged as a gift until the funds arrive.",
        },
        {
          value: "STIPEND_PAYABLE",
          label: "Stipend payable",
          help: "Compensation for service. Carries payroll consequences — withholding for non-minister employees, SECA for ministers — which this register does not resolve.",
        },
        {
          value: "RESTRICTED_GIFT_ON_ACCOUNT",
          label: "Restricted gift held on account",
          help: "Given for a stated purpose and not yet spent on it. The Kingdom must honour the restriction; spending it otherwise is a breach of trust that the Connecticut Attorney General may pursue.",
        },
      ],
    },
    {
      key: "ledgerAccountCode",
      label: "Treasury ledger account code",
      type: "text",
      section: "The account",
      placeholder: "e.g. 2100-REIMB",
      help: "The account in the Kingdom's chart of accounts that this member account rolls up into. Without it the sum of the member accounts cannot be tied to the general ledger, and an unreconcilable subsidiary ledger is worse than none.",
    },
    {
      key: "fundOrRestriction",
      label: "Fund or restriction",
      type: "text",
      section: "The account",
      help: "The named fund the balance sits in, and any donor restriction attached to it. Vague purposes are how restricted money is spent by accident.",
    },
    {
      key: "openingDate",
      label: "Date opened",
      type: "date",
      required: true,
      section: "The account",
      help: "The first day of the account's history. Entries dated before it indicate a migration that has not been documented.",
    },
    {
      key: "openedBy",
      label: "Opened by",
      type: "person",
      section: "The account",
      help: "The officer who opened the account. Accounts should not be opened by the person who will be their only reviewer.",
    },

    {
      key: "balanceBasis",
      label: "What the balance represents",
      type: "select",
      required: true,
      section: "Balance and basis",
      summary: true,
      help: "The legally operative question on this form. A cumulative gift history is not a balance and creates no claim; a payable is a debt the Kingdom owes; a receivable is a debt owed to it. Custody of a member's own money is none of these and is not permitted here.",
      options: [
        {
          value: "GIFT_HISTORY_NO_CLAIM",
          label: "Cumulative gifts — no claim, not a balance",
          help: "The correct basis for a contribution history. Money given is the Kingdom's; the figure is a record, not an entitlement.",
        },
        {
          value: "PAYABLE_TO_HOLDER",
          label: "Payable — the Kingdom owes the holder",
          help: "An ordinary liability, settled by payment to the holder and to nobody else.",
        },
        {
          value: "RECEIVABLE_FROM_HOLDER",
          label: "Receivable — the holder owes the Kingdom",
        },
        {
          value: "RESTRICTED_FUND_HELD",
          label: "Restricted fund held for a stated purpose",
          help: "The Kingdom's money, bound by the donor's restriction. Not the member's money held in custody.",
        },
        { value: "NIL", label: "Nil balance" },
      ],
    },
    {
      key: "currentBalance",
      label: "Current balance",
      type: "money",
      section: "Balance and basis",
      min: 0,
      help: "Stated as a positive figure; the direction comes from the basis above. Never carry a figure here that has not been reconciled to the general ledger.",
    },
    {
      key: "balanceAsOfDate",
      label: "Balance as of",
      type: "date",
      section: "Balance and basis",
      help: "The date the figure above was true. A balance without a date is not a balance.",
    },
    {
      key: "terms",
      label: "Terms of the account",
      type: "textarea",
      section: "Balance and basis",
      help: "How the account works in the member's own reading: what may be posted to it, when a payable is settled, when a receivable falls due. State expressly that the account bears no interest and permits no transfer to another member or to any third party. A member who was told the terms in writing cannot later describe the account as something else.",
    },
    {
      key: "disbursementAuthority",
      label: "How money may leave this account",
      type: "select",
      required: true,
      section: "Balance and basis",
      help: "The control that keeps this register on the lawful side of the line. Every permitted route runs between the Kingdom and the holder. No route runs from the holder to anyone else.",
      options: [
        { value: "NONE_RECORD_ONLY", label: "No disbursement — record only" },
        { value: "REIMBURSEMENT_TO_HOLDER", label: "Reimbursement to the holder on an approved claim" },
        { value: "STIPEND_TO_HOLDER", label: "Stipend paid to the holder through payroll" },
        {
          value: "APPLIED_TO_RESTRICTED_PURPOSE",
          label: "Applied by the Kingdom to the restricted purpose",
        },
        {
          value: "REFUND_TO_HOLDER",
          label: "Refund to the holder who paid it",
          help: "Back to the same person, by the same route where possible. A refund redirected to a third party is a transmission.",
        },
      ],
    },

    {
      key: "statementFrequency",
      label: "Statement frequency",
      type: "select",
      section: "Statements and access",
      help: "How often the holder is sent their record. Quarterly is the working standard; annual is the minimum, and an annual statement must reach the member in January so the substantiation it supports is contemporaneous.",
      options: [
        { value: "MONTHLY", label: "Monthly" },
        { value: "QUARTERLY", label: "Quarterly" },
        { value: "SEMIANNUAL", label: "Semi-annual" },
        { value: "ANNUAL", label: "Annual" },
        {
          value: "ON_REQUEST",
          label: "On request only",
          help: "Acceptable only where the holder has continuous online access to the same data.",
        },
      ],
    },
    {
      key: "lastStatementDate",
      label: "Date of last statement issued",
      type: "date",
      section: "Statements and access",
      summary: true,
      help: "An account whose last statement is more than a year old is an account nobody has checked. That is the condition in which errors become allegations.",
    },
    {
      key: "statementDelivery",
      label: "Statement delivery",
      type: "select",
      section: "Statements and access",
      help: "How the statement reaches the holder. Record it, because a member who says they never received their record is answered by the route and the date, not by an assurance that it was sent.",
      options: [
        { value: "POST", label: "Post" },
        { value: "EMAIL", label: "Email" },
        { value: "PORTAL", label: "Secure portal" },
        { value: "COLLECTED", label: "Collected in person" },
      ],
    },
    {
      key: "onlineAccess",
      label: "Holder has online access to the account",
      type: "boolean",
      section: "Statements and access",
      help: "Whether the member can read their own record without asking an officer for it. Self-service access is the cheapest error-detection the Kingdom will ever have.",
    },
    {
      key: "lastSubstantiationLetterDate",
      label: "Date of last substantiation letter",
      type: "date",
      section: "Statements and access",
      help: "The last written acknowledgment issued under 26 U.S.C. § 170(f)(8). It must state the amount and either that no goods or services were provided or a description and good-faith estimate of any that were, and it must be in the donor's hands by the earlier of the date they file or their return's due date.",
    },

    {
      key: "lastReconciledDate",
      label: "Date last reconciled to the ledger",
      type: "date",
      section: "Reconciliation and disputes",
      help: "When this account was last agreed to the general ledger control account. Reconciliation by someone other than the person who posts entries is the whole point of having two people.",
    },
    {
      key: "disputeNotes",
      label: "Queries and their resolution",
      type: "textarea",
      section: "Reconciliation and disputes",
      help: "Every query the holder has raised and what was done about it, dated. A record showing that members query their accounts and get answers is the strongest evidence there is that the ledger is honest.",
    },

    {
      key: "closureDate",
      label: "Date closed",
      type: "date",
      section: "Closure",
      help: "The date the account was settled and closed. Closure never depends on continued membership; a departing member's account is settled on the same terms as anyone else's.",
    },
    {
      key: "closureReason",
      label: "Reason for closure",
      type: "select",
      section: "Closure",
      help: "Why the account ended. Withdrawal from membership closes the account but settles it on ordinary terms; it never forfeits a balance the Kingdom owes.",
      options: [
        { value: "SETTLED", label: "Settled in full" },
        { value: "WITHDRAWAL", label: "Holder withdrew from membership" },
        { value: "DEATH", label: "Death of the holder", help: "A credit balance is owed to their estate." },
        { value: "MERGED", label: "Merged into another account" },
        { value: "WRITTEN_OFF", label: "Receivable written off" },
        { value: "DORMANT_ESCHEATED", label: "Dormant — remitted as unclaimed property" },
      ],
    },
    {
      key: "residualBalanceTreatment",
      label: "Treatment of any residual balance",
      type: "textarea",
      section: "Closure",
      help: "What happened to money still standing to the account at closure, and on whose authority. A credit balance absorbed into general funds without the holder's written direction is the Kingdom keeping money that is not its own — and forgiving a receivable owed by an officer is a benefit conferred on that officer.",
    },
    {
      key: "notes",
      label: "Internal notes",
      type: "textarea",
      section: "Closure",
      classification: "SEALED",
      help: "Anything an officer picking this account up in five years would need. Do not record pastoral or disciplinary material here; it belongs in its own file.",
    },
  ],
};

export default memberAccounts;
