'use client';

import { useTranslations } from 'next-intl';

export function TermsClient() {
  const t = useTranslations('terms');

  return (
    <main className="grow">
      <section className="mx-auto max-w-4xl px-4 pt-8 pb-16">
        <h1 className="text-4xl sm:text-5xl font-medium text-foreground text-center mb-16">
          {t('title')}
        </h1>

        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-sm sm:text-lg leading-relaxed mb-6">
            {t('intro')}
          </p>

          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('acceptance')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('modifications.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('modifications.content')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('collection.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('collection.intro')}
          </p>

          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('collection.additionalUses')}
          </p>

          <h3 className="text-base sm:text-lg font-medium mt-6 mb-4">
            {t('collection.personalInfo.title')}
          </h3>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('collection.personalInfo.intro')}
          </p>

          <h4 className="text-sm sm:text-base font-medium mt-4 mb-2">
            {t('collection.personalInfo.directCollection.title')}
          </h4>
          <p className="text-sm sm:text-base leading-relaxed mb-4">
            {t('collection.personalInfo.directCollection.content')}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t
              .raw('collection.personalInfo.directCollection.items')
              .map((item: string, index: number) => (
                <li
                  key={index}
                  className="leading-relaxed mb-2 text-sm sm:text-base"
                >
                  {item}
                </li>
              ))}
          </ul>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('collection.personalInfo.directCollection.note')}
          </p>

          <h4 className="text-sm sm:text-base font-medium mt-4 mb-2">
            {t('collection.personalInfo.usageData.title')}
          </h4>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('collection.personalInfo.usageData.content')}
          </p>

          <h4 className="text-sm sm:text-base font-medium mt-4 mb-2">
            {t('collection.personalInfo.thirdParty.title')}
          </h4>
          <p className="text-sm sm:text-base leading-relaxed mb-4">
            {t('collection.personalInfo.thirdParty.content')}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t
              .raw('collection.personalInfo.thirdParty.items')
              .map((item: string, index: number) => (
                <li
                  key={index}
                  className="leading-relaxed mb-2 text-sm sm:text-base"
                >
                  {item}
                </li>
              ))}
          </ul>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('collection.personalInfo.thirdParty.tracking')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('collection.personalInfo.thirdParty.processing')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('usage.title')}
          </h2>

          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('usage.services')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('usage.marketing')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('usage.security')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('usage.communication')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('cookies.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('cookies.content')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('cookies.browserNote')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('disclosure.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('disclosure.intro')}
          </p>
          <ul className="list-disc pl-6 mb-6">
            {t.raw('disclosure.items').map((item: string, index: number) => (
              <li
                key={index}
                className="leading-relaxed mb-2 text-sm sm:text-base"
              >
                {item}
              </li>
            ))}
          </ul>

          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('disclosure.tableIntro')}
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {t
                    .raw('disclosure.table.headers')
                    .map((header: string, index: number) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 text-left font-medium text-xs sm:text-sm"
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {t
                  .raw('disclosure.table.rows')
                  .map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-300 px-4 py-2 text-xs sm:text-sm"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('disclosure.sensitiveNote')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('disclosure.consentNote')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('disclosure.sharingNote')}
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {t
                    .raw('disclosure.sharingTable.headers')
                    .map((header: string, index: number) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 text-left font-medium text-xs sm:text-sm"
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {t
                  .raw('disclosure.sharingTable.rows')
                  .map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-300 px-4 py-2 text-xs sm:text-sm"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('thirdPartySites.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('thirdPartySites.content')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('childrenData.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('childrenData.content')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('childrenData.note')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('security.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('security.content')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('security.retention')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('rights.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('rights.intro')}
          </p>
          <ul className="list-disc pl-6 mb-6">
            {t.raw('rights.rightsList').map((right: string, index: number) => (
              <li
                key={index}
                className="leading-relaxed mb-2 text-sm sm:text-base"
              >
                {right}
              </li>
            ))}
          </ul>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('rights.exercise')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('rights.noDiscrimination')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('complaints.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('complaints.content')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('international.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('international.content')}
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('international.transfers')}
          </p>

          <h2 className="text-lg sm:text-xl font-medium mt-8 mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6">
            {t('contact.content')}
          </p>

          <div className="text-right mt-12">
            <p className="text-sm text-foreground/70">{t('lastUpdated')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
