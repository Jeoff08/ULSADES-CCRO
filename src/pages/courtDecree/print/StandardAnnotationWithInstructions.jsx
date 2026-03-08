import React from 'react'

/** Instructions page – Adoption (R.A. 11222). Not a print document; viewable reference page. */
const Bold = ({ children }) => <span className="font-bold">{children}</span>

export default function StandardAnnotationWithInstructions({ onBack }) {
  return (
    <div className="instructions-page w-full min-h-screen bg-white">
      <div className="bg-[var(--primary-blue)] text-white py-6 px-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide">Standard Annotations with Instructions</h1>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition"
          >
            Back to Print
          </button>
        )}
      </div>
      <div className="p-8 text-left text-lg leading-relaxed space-y-5">
        <div>
          <p className="font-bold">1 ADOPTION</p>
          <p className="font-bold">A. R.A 11222</p>
        </div>

        <p className="font-bold text-gray-900">
          CASE 1. Place of Registration of the Simulated Birth Certificate is the actual place of birth or the place where the child was found.
        </p>

        <p>
          Upon receipt of the original or certified photocopy of the Order of Administrative Adoption and the original Certificate of Finality from the DSWD Regional Office or the petitioner or his/her authorized representative, the LCRO of the city/municipality where the child was born or found shall:
        </p>

        <div className="pl-4 space-y-4">
          <div>
            <p className="font-bold mb-1">1.1 ASCERTAIN</p>
            <p className="mb-2">
              <Bold>ASCERTAIN</Bold> whether the child was born or found within its territorial jurisdiction based on the Order of Administrative Adoption. The LCR shall <Bold>NOT</Bold> register the Order of Administrative Adoption if he/she finds any error in the decision and refer to the DSWD for correction and its subsequent issuance of Amended Order of Administrative Adoption and Amended Certificate of Finality.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.2 VERIFY THE AUTHENTICITY</p>
            <p className="mb-2">
              <Bold>VERIFY THE AUTHENTICITY</Bold> of the submitted Order of Administrative Adoption based on the following:
            </p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. Received certified copy of the said Order of Administrative Adoption previously endorsed by the DSWD Regional Office, if available;</li>
              <li>ii. Certification or letter coming from the concerned DSWD Regional Office confirming the authenticity of the Order of Administrative Adoption; or</li>
              <li>iii. Copy of the Order of Administrative Adoption either through the PSA Central Office (CO) based on the received electronic copy from the DSWD Secretary or the submitted copy from the DSWD Regional Office.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">1.3</p>
            <p className="mb-2">
              After being satisfied as to the <Bold>VERACITY, COMPLETENESS AND CONSISTENCY</Bold> of the entries therein, <Bold>REGISTER</Bold> the Order of Adoption with the Certificate of Finality, and <Bold>ENTER</Bold> the same to the corresponding Registry Book For Court Decrees, designating the proper registry number. Once registered, the concerned LCRO shall <Bold>ISSUE</Bold> the <Bold>CERTIFICATE OF REGISTRATION</Bold> of the Order of Administrative Adoption and <Bold>CERTIFICATE OF AUTHENTICITY</Bold>.
            </p>
            <p className="mb-1 font-medium">The required documents for registration are:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. ORIGINAL/CERTIFIED PHOTOCOPY of the Order of Administrative Adoption; and</li>
              <li>ii. ORIGINAL/CERTIFIED PHOTOCOPY of the Certificate of Finality of the Order of Administrative Adoption</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">1.4 AFTER SECURING AND RETAINING</p>
            <p className="mb-3">
              <Bold>AFTER SECURING AND RETAINING</Bold> a <Bold>CERTIFIED PHOTOCOPY</Bold> of the <Bold>SIMULATED COLB WITHOUT ANNOTATION</Bold>, you shall <Bold>STAMP</Bold> the word &quot;<Bold>CANCELLED</Bold>&quot; on the original copy of the simulated COLB and annotate the following remarks therein:
            </p>
            <div className="bg-amber-100 p-4 my-3">
              <p>
                The registration of the Certificate of Live Birth of <Bold>&lt;Name of the child as indicated in the Simulated COLB&gt;</Bold> bearing Registry No. ______ is hereby cancelled pursuant to the Order of the Administrative Adoption under Case No. ______ rendered by Sec. <Bold>&lt;Full Name of the DSWD Secretary&gt;</Bold> of the DSWD in accordance with R.A. 11222.
              </p>
            </div>
            <p className="mb-2">
              The corresponding entry of the simulated birth in the Registry Book of Live Birth should have the following notation in the remarks portion:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                Cancelled in accordance with the Order of Administrative Adoption dated _______ pursuant to R.A. 11222.
              </p>
            </div>
            <p className="mb-2">Distribution of two (2) certified copies of the cancelled and annotated simulated COLB:</p>
            <ul className="list-none pl-4 space-y-1 mb-2">
              <li>i. First copy to the OCRG/PSA</li>
              <li>ii. Second copy is office file</li>
            </ul>
            <p>
              The certified copy of the simulated COLB without remarks should be maintained per Memorandum Circular 2019-21 and not be issued to the petitioner or any interested party unless by DSWD Secretary or court order.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.5 PREPARE AND REGISTER</p>
            <p className="mb-2">
              <Bold>PREPARE AND REGISTER</Bold> two (2) copies of the New/Rectified Birth Record (either COLB or COF), based on the Draft Rectified Birth Record attached to the Order of Administrative Adoption. The Rectified Birth Record, bearing the names of biological parents or a foundling certificate, shall not bear any notation (Section 26 IRR).
            </p>
            <p className="mb-2">
              The facts of the vital event should be entered in the corresponding Registry Book of Live Birth or Registry Book of Foundling, whichever is applicable, assign with the proper registry number but with remarks as follows:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                Registered in accordance with the Order of Administrative Adoption dated _______ with Registry Number _______ pursuant to R.A No. 11222.
              </p>
            </div>
            <p className="mb-2">
              The remarks or annotations is applicable only to the Registry Books of Live Birth or Registry Book of Foundling, as the case may be. The Rectified Birth Record shall not be issued to the petitioner or any interested party unless ordered by DSWD Secretary or through a proper court.
            </p>
            <p className="mb-1 font-medium">Distribution of registered copies of the Rectified Birth Record:</p>
            <ul className="list-none pl-4 space-y-1 mb-2">
              <li>i. First copy to OCRG/PSA; and</li>
              <li>ii. Second copy office file</li>
            </ul>
            <p>
              The informant can be PAPs (Prospective Adoptive Parents), a Social Worker from the DSWD Regional Office, or authorized persons by the adopting parent(s).
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.6 Sealing of Certificates</p>
            <p>
              The cancelled Simulated Birth Certificate and the Rectified Birth Record shall be <Bold>SEALED</Bold> in the civil registry records and shall be released or issued only upon the order of the DSWD Secretary or upon order of the court.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.7 Issuance of New Birth Certificate</p>
            <p className="mb-2">
              After sealing, the concerned LCRO shall <Bold>PREPARE AND ISSUE</Bold> a New Birth Certificate in four (4) copies <Bold>WITH THE SAME Registry Number</Bold> as in the Rectified Birth Record, indicating the petitioner/s as parents and the entries required in the registration pursuant to the Order of Administrative Adoption.
            </p>
            <p className="mb-1 font-medium">Distribution of the four (4) copies of the New Birth Certificate:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. First copy to the registrant/petitioner;</li>
              <li>ii. Second copy to the OCRG/PSA;</li>
              <li>iii. Third copy office file</li>
              <li>iv. Fourth copy to the DSWD Secretary</li>
            </ul>
            <p className="mt-2">
              The fourth copy to the DSWD Secretary should be transmitted via registered mail or courier service as proof of compliance with the administrative adoption order.
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-300" />

        <p className="font-bold text-gray-900">
          CASE 2. Place of Registration of the Simulated Birth Certificate is not the actual place of birth or the place where the child was found.
        </p>

        <p>
          Upon receipt of the original or certified photocopy of the Order of Administrative Adoption and the original Certificate of Finality from the DSWD Regional Office or the petitioner or his/her authorized representative, the LCRO of the city/municipality where the child was born or found shall:
        </p>

        <div className="pl-4 space-y-4">
          <div>
            <p className="font-bold mb-1">1.1 ASCERTAIN</p>
            <p className="mb-2">
              <Bold>ASCERTAIN</Bold> whether the child was born or found within its territorial jurisdiction based on the Order of Administrative Adoption. The LCR shall <Bold>NOT</Bold> register the Order of Administrative Adoption if he/she finds any error in the decision and refer to the DSWD for correction and its subsequent issuance of Amended Order of Administrative Adoption and Amended Certificate of Finality.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.2 VERIFY THE AUTHENTICITY</p>
            <p className="mb-2">
              <Bold>VERIFY THE AUTHENTICITY</Bold> of the submitted Order of Administrative Adoption based on the following:
            </p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. Received certified copy of the said Order of Administrative Adoption previously endorsed by the DSWD Regional Office, if available;</li>
              <li>ii. Certification or letter coming from the concerned DSWD Regional Office confirming the authenticity of the Order of Administrative Adoption; or</li>
              <li>iii. Copy of the Order of Administrative Adoption either through the PSA Central Office (CO) based on the received electronic copy from the DSWD Secretary or the submitted copy from the DSWD Regional Office.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">1.3</p>
            <p className="mb-2">
              After being satisfied as to the <Bold>VERACITY, COMPLETENESS AND CONSISTENCY</Bold> of the entries therein, <Bold>REGISTER</Bold> the Order of Adoption with the Certificate of Finality, and <Bold>ENTER</Bold> the same to the corresponding Registry Book For Court Decrees, designating the proper registry number. Once registered, the concerned LCRO shall <Bold>ISSUE</Bold> the <Bold>CERTIFICATE OF REGISTRATION</Bold> of the Order of Administrative Adoption and <Bold>CERTIFICATE OF AUTHENTICITY</Bold>.
            </p>
            <p className="mb-1 font-medium">The required documents for registration are:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. ORIGINAL/CERTIFIED PHOTOCOPY of the Order of Administrative Adoption; and</li>
              <li>ii. ORIGINAL/CERTIFIED PHOTOCOPY of the Certificate of Finality of the Order of Administrative Adoption</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">1.4 After registration, shall FURNISH A COPY</p>
            <p>
              After registration, the LCRO shall <Bold>FURNISH A COPY</Bold> of the Certificate of Registration of the Order of Administrative Adoption and the Certificate of Authenticity to the LCRO which previously registered the simulated COLB, <Bold>FOR CANCELLATION</Bold>.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.5 PREPARE AND REGISTER</p>
            <p className="mb-2">
              <Bold>PREPARE AND REGISTER</Bold> two (2) copies of the New/Rectified Birth Record (either COLB or COF), entries of which are based on the Draft Rectified Birth Record attached to the Order of Administrative Adoption. The Rectified Birth Record bearing the name of the biological parents of the child or foundling certificate, as the case may be, shall not bear any notation (Section 26 IRR). The informant may be the PAPs or Social Worker of the DSWD Regional Office or any interested persons authorized by the adopting parent(s).
            </p>
            <p className="mb-2">
              The facts of the vital event should be entered in the corresponding Registry Book of Live Birth or Registry Book of Foundling, whichever is applicable, assign with the proper registry number but with remarks as follows:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                Registered in accordance with the Order of Administrative Adoption dated _______ with Registry Number _______ pursuant to R.A No. 11222.
              </p>
            </div>
            <p className="mb-2">
              The remarks or annotations is applicable only to the Registry Books of Live Birth or Registry Book of Foundling, as the case may be. The Rectified Birth Record shall not be issued to the petitioner or any interested party unless ordered by DSWD Secretary or through order by a proper court.
            </p>
            <p className="mb-1 font-medium">The distribution of the two (2) registered copies of the Rectified Birth Record as follows:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. First copy to OCRG/PSA; and</li>
              <li>ii. Second copy office file</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">1.6</p>
            <p>
              The cancelled Simulated Birth Certificate and the Rectified Birth Record shall be <Bold>SEALED</Bold> in the civil registry records and shall be released or issued only upon the order of the DSWD Secretary or upon order of the court.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.7</p>
            <p className="mb-2">
              After sealing the cancelled Simulated Birth Certificate and the Rectified Birth Record, the concerned LCRO shall <Bold>PREPARE AND ISSUE</Bold> a New Birth Certificate in four (4) copies <Bold>WITH THE SAME Registry Number</Bold> as in the Rectified Birth Record, indicating the petitioner/s as parents and the entries required in the registration pursuant to the Order of Administrative Adoption.
            </p>
            <p className="mb-1 font-medium">The distribution of the four (4) copies of the New Birth Certificate are as follows:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. First copy to the registrant/petitioner;</li>
              <li>ii. Second copy to the OCRG/PSA;</li>
              <li>iii. Third copy office file</li>
              <li>iv. Fourth copy to the DSWD Secretary</li>
            </ul>
            <p className="mt-2">
              Transmit the fourth copy to the DSWD Secretary through registered mail or any courier service as proof of compliance to the order of administrative adoption.
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase">
          LCRO of the City/Municipality Where the Child&apos;s Simulated Birth Record Was Registered
        </p>

        <div className="pl-4 space-y-4">
          <div>
            <p className="font-bold mb-1">1.1</p>
            <p>
              Upon receipt of the certified photocopies of the Order of Administrative Adoption and its Certificate of Finality, <Bold>ORIGINAL</Bold> Certificate of Registration of the Order of Administrative Adoption, and <Bold>ORIGINAL</Bold> Certificate of Authenticity of the Order of Administrative Adoption, the civil registrar shall <Bold>EVALUATE THE COMPLETENESS AND ACCURACY</Bold> of the required documents.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.2</p>
            <p className="mb-2">
              Once satisfied as to the <Bold>COMPLETENESS AND CONSISTENCY</Bold> of the required documents, the LCRO <Bold>AFTER SECURING AND RETAINING A CERTIFIED PHOTOCOPY OF THE SIMULATED COLB WITHOUT ANNOTATION</Bold>, shall <Bold>STAMP</Bold> the word &quot;<Bold>CANCELLED</Bold>&quot; on the original copy of the simulated COLB and annotate the following remarks therein:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                The registration of the Certificate of Live Birth of <Bold>&lt;Name of the child as indicated in the Simulated COLB&gt;</Bold> bearing Registry No. _______ is hereby cancelled pursuant to the Order of the Administrative Adoption under Case No. _______ rendered by Sec. <Bold>&lt;Full Name of the DSWD Secretary&gt;</Bold> of the DSWD in accordance with R.A. 11222.
              </p>
            </div>
            <p className="mb-2">
              The corresponding entry of the simulated birth in the Registry Book of Live Birth should have the following notation in the remarks portion:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                Cancelled in accordance with the Order of Administrative Adoption dated _______ pursuant to R.A. 11222.
              </p>
            </div>
            <p className="mb-2">The three (3) certified copies of the cancelled and annotated simulated COLB is to be distributed as follows:</p>
            <ul className="list-none pl-4 space-y-1 mb-2">
              <li>i. First copy to the OCRG/PSA</li>
              <li>ii. Second copy is office file</li>
              <li>iii. Third copy to the LCRO of the city/municipality where the child&apos;s simulated birth record was registered for their filing.</li>
            </ul>
            <p>
              The certified copy of the simulated COLB without remarks should be maintained pursuant to Memorandum Circular 2019-21. The maintained copy shall not be issued to the petitioner or any interested party unless ordered by the DSWD Secretary or through order by a proper court.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.3</p>
            <p>
              The cancelled simulated birth certificate shall be <Bold>SEALED</Bold> in the civil registry records and shall be released or issued only upon the order of the DSWD Secretary or upon order of the court.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.4</p>
            <p>
              The LCRO shall complete all processes within three (3) working days from receipt of the complete required documents.
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase">
          Order of Rescission of Administrative Adoption
        </p>

        <p className="mb-4">
          Below are the steps to be followed in the registration of the Order of Rescission of Administrative Adoption.
        </p>

        <div className="pl-4 space-y-4">
          <div>
            <p className="font-bold mb-1">1.1 Verification of Authenticity</p>
            <p className="mb-2">
              Upon receipt of the <Bold>ORIGINAL</Bold> or <Bold>CERTIFIED</Bold> photocopy of the Order of Rescission of Administrative Adoption and the pertinent Certificate of Finality from the DSWD Regional Office or the petitioner or his/her representative, the LCRO of the city/municipality where the child was born shall verify the authenticity of the submitted Order of Rescission of Administrative Adoption based on the following:
            </p>
            <ul className="list-none pl-4 space-y-1">
              <li>a. Received certified copy of the said Order of Rescission of Administrative Adoption previously endorsed by the DSWD Regional Office, if available; or</li>
              <li>b. Certificate or letter coming from the concerned DSWD Regional Office confirming the authenticity of the Order of Rescission of Administrative Adoption;</li>
              <li>c. Copy of the Order of Rescission of Administrative Adoption either through the PSA Central Office (CO) based on the received electronic copy from the DSWD Secretary or the submitted copy from the DSWD Regional Office.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">1.2 Registration Process and Required Documents</p>
            <p className="mb-2">
              After being satisfied as to the <Bold>VERACITY, COMPLETENESS AND ACCURACY</Bold> of entries therein, <Bold>REGISTER</Bold> the Order of Rescission of Administrative Adoption with the Certificate of Finality, and <Bold>ENTER THE SAME</Bold> to the corresponding Book of Registry of Court Decrees, designating the proper registry number. Once registered, the LCRO shall <Bold>ISSUE</Bold> the Certificate of Registration of the Order of Rescission of Administrative Adoption and Certificate of Authenticity of the Order of Rescission of Administrative Adoption.
            </p>
            <p className="mb-1 font-medium">The required documents for registration at the LCRO are:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>i. The original/certified photocopy of the Order of Rescission of Administrative Adoption</li>
              <li>ii. The original/certified photocopy of the Certificate of Finality</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">1.3 Annotation and Remarks for New Birth Certificate</p>
            <p className="mb-2">
              After <Bold>SECURING AND RETAINING</Bold> a certified photocopy of the New Birth Certificate without annotation, shall <Bold>STAMP</Bold> the word &quot;<Bold>CANCELLED</Bold>&quot; on the original copy of the New Birth Certificate and annotate the following remarks therein:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                The Certificate of Live Birth of <Bold>&lt;Full name of child as indicated in the New Birth Certificate&gt;</Bold> bearing Registry No. ________ is hereby cancelled pursuant to the Order of Rescission of Administrative Adoption dated ________ rendered by Sec. <Bold>&lt;Full name of the DSWD Secretary&gt;</Bold> of the DSWD under Case No. ________ in accordance with R.A. 11222. Henceforth, the adoption of the said child is hereby rescinded.
              </p>
            </div>
            <p className="mb-2">
              The corresponding entry in the Registry Book where the rectified COLB/COF was entered will have the following additional remarks:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                The Certificate of Live Birth of <Bold>&lt;Name of child in the New Birth Certificate&gt;</Bold> is hereby cancelled in accordance with the Order of Rescission of Administrative Adoption dated _______ pursuant to R.A. 11222
              </p>
            </div>
            <p>
              The certified copy of the New Birth Certificate without remarks or annotation should be maintained pursuant to Memorandum Circular 2019-21. The maintained copy shall not be issued to the petitioner or any interested party unless ordered by the DSWD Secretary or through order of a proper court.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">1.4 Restoration of COLB/COF</p>
            <p>
              The LCR shall <Bold>RESTORE</Bold> the child&apos;s rectified COLB or COF, whichever is applicable.
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase">
          B. R.A. 11642
        </p>

        <p className="mb-4">
          Upon receipt of the <Bold>ORIGINAL</Bold> or <Bold>CERTIFIED true copy</Bold> of the Order of Adoption and Certificate of Finality from the Executive Director, adult adoptee, adopters, or the petitioner/authorized representative, the LCRO of the child&apos;s birth/found city/municipality shall:
        </p>

        <div className="pl-4 space-y-4">
          <div>
            <p className="font-bold mb-1">a. ASCERTAIN</p>
            <p>
              The LCRO must <Bold>ASCERTAIN</Bold> if the child was born or found within its territorial jurisdiction based on the Order of Adoption. The LCR shall <Bold>NOT</Bold> register the Order if discrepancies are found in the entries of the Order of Adoption and/or Certificate of Finality. Discrepancies must be referred to the NACC (National Authority for Child Care) for correction and subsequent issuance of an Amended Order/Certificate.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">b. VERIFY Authenticity</p>
            <p className="mb-2">
              The civil registrar must <Bold>VERIFY</Bold> the authenticity of the submitted Order of Adoption based on any of the following:
            </p>
            <ul className="list-none pl-4 space-y-1">
              <li>1. Original copy of the Order of Adoption previously endorsed by the Executive Director (if available).</li>
              <li>2. Certification or letter from the concerned RACCO or NACC confirming authenticity, or a Certificate issued by ICAB/NACC for inter-country adoptions, along with a Certified True Copy of Placement Authority from NACC.</li>
              <li>3. Copy of the Order of Adoption obtained through the PSA Central Office (CO), based on electronic and physical copies received from the Executive Director.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">c. REGISTER and ISSUE</p>
            <p className="mb-2">
              After verifying the <Bold>VERACITY, COMPLETENESS, AND CONSISTENCY</Bold> of entries, the LCRO must <Bold>REGISTER</Bold> the Order of Adoption with the Certificate of Finality. The order should be <Bold>ENTERED</Bold> into the Book of Registry for Court Decrees and assigned a proper registry number. Once registered, the LCRO must <Bold>ISSUE</Bold> the Certificate of Registration and Authenticity of the Order of Adoption.
            </p>
            <p className="mb-1 font-medium">Required documents for registration at the LCRO:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>1. Original/certified true copy of the Order of Adoption with an attached original/certified photocopy of the Draft New COLB.</li>
              <li>2. Original/certified true copy of the Certificate of Finality of the Order of Adoption.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">d. RETAIN and SEAL COLB</p>
            <p className="mb-2">
              The LCR shall <Bold>RETAIN</Bold> the original Certificate of Live Birth (COLB) without annotation and <Bold>SEAL</Bold> it. This also includes the certified true copy of the COLB with annotation reflecting the adoption in the civil registry records. The original or certified photocopy of the COLB without annotation should not be issued to the adopter/petitioner or any interested party unless specifically ordered by the Executive Director or a proper court.
            </p>
            <p className="mb-2">
              The certified true copy of the COLB shall be stamped &quot;<Bold>CANCELLED</Bold>&quot; and SEALED with the following annotation:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                The child is hereby adopted pursuant to the Order of Adoption under Case No. ________ dated ________ rendered by Executive Director ________ of the National Authority for Child Care in accordance with R.A. 11642
              </p>
            </div>
          </div>

          <div>
            <p className="font-bold mb-1">e. ANNOTATE Birth Entry</p>
            <p className="mb-2">
              The corresponding entry of the birth in the Registry Book of Live Birth should include the following annotation in its remarks portion:
            </p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                Sealed in accordance with the Order of Adoption under Case No. ________ dated ________ pursuant to R.A. 11642.
              </p>
            </div>
          </div>

          <div>
            <p className="font-bold mb-1">f. PREPARE AND ISSUE New COLB</p>
            <p className="mb-2">
              After sealing the original and annotated certified true copy of the COLB, the LCRO must <Bold>PREPARE AND ISSUE</Bold> a New COLB. This New COLB must be in four (4) copies and bear the <Bold>SAME REGISTRY NUMBER</Bold> as the original COLB/COF/COLB of persons with no known parents. It should indicate the adopter/s or petitioner/s as parent/s and include other entries required by the Order of Adoption.
            </p>
            <p className="mb-1 font-medium">The distribution of the four (4) copies of the New COLB:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>1. First copy to the registrant/petitioner</li>
              <li>2. Second copy to OCRG/PSA</li>
              <li>3. Third copy office file</li>
              <li>4. Fourth copy to NACC</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">g. TRANSMIT Fourth Copy</p>
            <p>
              The concerned LCRO shall transmit the fourth copy of the New COLB to the Executive Director within thirty (30) calendar days from receipt of the Order of Adoption and Certificate of Finality. This transmission serves as proof of compliance and must be done through registered mail or any courier service.
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase">
          Order of Rescission of Adoption (R.A. 11642)
        </p>

        <p className="mb-4">
          Processes for authentication and registration of the Order of Rescission of Adoption should be similar to those for the Order of Adoption.
        </p>

        <div className="pl-4 space-y-3">
          <div>
            <p className="font-bold mb-1">a. Required Documents for Registration at the LCRO:</p>
            <ul className="list-none pl-4 space-y-1">
              <li>1. Original or Certified true copy of the Order of Rescission of Adoption.</li>
              <li>2. Original or Certified true copy of the Certificate of Finality.</li>
            </ul>
          </div>
          <div><p className="font-bold mb-1">b. SECURE AND RETAIN:</p><p>Secure and retain a certified true copy of the NEW COLB/ROB (Certificate of Live Birth/Report of Birth) without annotation.</p></div>
          <div><p className="font-bold mb-1">c. STAMP:</p><p>Stamp the word &quot;<Bold>CANCELLED</Bold>&quot; on the original copy of the NEW COLB/ROB (amended).</p></div>
          <div>
            <p className="font-bold mb-1">d. Annotate the following remarks on the New COLB/ROB:</p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                The Certificate of Live Birth/Report of Birth of ________ bearing Registry No. ________ is hereby cancelled pursuant to the Order of Rescission of Adoption under Case No. ________ dated ________ rendered by Executive Director ________ in accordance with R.A. 11642. Henceforth, the adoption of the said child is hereby rescinded.
              </p>
            </div>
          </div>
          <div>
            <p className="font-bold mb-1">e. Annotate in the corresponding entry in the Registry Book (additional remarks for persons with no known parents):</p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                Adoption Rescinded in accordance with the Order of Rescission of Adoption under Case No. ________ dated ________ pursuant to R.A. 11642
              </p>
            </div>
          </div>
          <div><p className="font-bold mb-1">f. UNSEAL:</p><p>Unseal the original COLB/COF/ROB/COLB with no known parents prior to adoption and the certified true copy with previous annotation.</p></div>
          <div>
            <p className="font-bold mb-1">g. ANNOTATE on the certified true copy reflecting the Order of Adoption the following:</p>
            <div className="bg-amber-100 p-4 my-2">
              <p>
                The adoption is hereby rescinded pursuant to the Order of Rescission of Adoption under Case No. ________ dated ________ rendered by the Executive Director ________ of the National Authority for Child Care in accordance with R.A. 11642.
              </p>
            </div>
          </div>
          <div><p className="font-bold mb-1">h. CERTIFIED TRUE COPY:</p><p>Create a certified true copy of the cancelled NEW COLB/ROB for endorsement to the OCRG.</p></div>
          <div><p className="font-bold mb-1">i. SEAL:</p><p>Seal the cancelled New COLB/ROB together with the certified true copy of the unannotated New COLB/ROB and the certified true copy of the annotated original COLB/COF/ROB/COLB reflecting the Order of Adoption and Rescission of Adoption.</p></div>
          <div><p className="font-bold mb-1">j. TRANSMIT:</p><p>Transmit the certified true copy of the cancelled New COLB/ROB to NACC as proof of compliance.</p></div>
          <div><p className="font-bold mb-1">k. ISSUE:</p><p>Issue a copy of the original unannotated COLB/COF/ROB/COLB with no known parents to the proper interested party whenever requested.</p></div>
        </div>

        <hr className="my-8 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase mb-2">
          Annulment of Marriage / Declaration of Nullity of Marriage / Legal Separation / Divorce
        </p>
        <div className="bg-amber-100 p-4 my-2">
          <p>
            Pursuant to the decision dated ________ rendered by Judge ________ of the Regional Trial Court of ________ Branch ________ under Case No. ________, the marriage between ________ and ________ celebrated on ________ is hereby declared ________
          </p>
        </div>

        <hr className="my-6 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase mb-2">
          For Presumption of Death
        </p>
        <div className="bg-amber-100 p-4 my-2">
          <p>
            Spouse declared presumptively dead as per court decree issued by Regional Trial Court of ________ Branch ________ on ________ under Case No. ________
          </p>
        </div>

        <hr className="my-6 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase mb-2">
          Cancellation of Civil Registry Document
        </p>
        <div className="bg-amber-100 p-4 my-2">
          <p>
            Pursuant to the decision of the Court dated ________ rendered by Judge ________ of the Regional Trial Court of ________ Branch ________ under Case No. ________, this Certificate of ________ bearing Registry Number ________ is hereby ordered cancelled.
          </p>
        </div>

        <hr className="my-6 border-gray-300" />

        <p className="font-bold text-gray-900 uppercase mb-2">
          Correction of Entry
        </p>
        <div className="bg-amber-100 p-4 my-2">
          <p>
            Pursuant to the decision of the Court dated ________ rendered by Judge ________ of the Regional Trial Court of ________ Branch ________ under Case No. ________, the (ENTRY) is hereby corrected from ________ to ________
          </p>
        </div>
      </div>
    </div>
  )
}
