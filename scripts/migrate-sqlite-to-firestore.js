const { PrismaClient } = require('@prisma/client')
const { cert, getApp, getApps, initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

function getAdminDb() {
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: requiredEnv('FIREBASE_PROJECT_ID'),
            clientEmail: requiredEnv('FIREBASE_CLIENT_EMAIL'),
            privateKey: requiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
          }),
        })
  return getFirestore(app)
}

async function writeCollection(db, name, rows) {
  if (!rows.length) return
  const size = 300
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size)
    const batch = db.batch()
    for (const row of chunk) {
      const id = String(row.id)
      const data = { ...row }
      delete data.id
      batch.set(db.collection(name).doc(id), data, { merge: true })
    }
    await batch.commit()
  }
}

async function main() {
  loadEnvFile()
  const prisma = new PrismaClient()
  const db = getAdminDb()
  try {
    const [
      projects,
      projectTranslations,
      translations,
      settings,
      users,
      contactSubmissions,
      pages,
      pageSections,
      pageSectionTranslations,
      media,
    ] = await Promise.all([
      prisma.project.findMany(),
      prisma.projectTranslation.findMany(),
      prisma.translation.findMany(),
      prisma.setting.findMany(),
      prisma.user.findMany(),
      prisma.contactSubmission.findMany(),
      prisma.page.findMany(),
      prisma.pageSection.findMany(),
      prisma.pageSectionTranslation.findMany(),
      prisma.media.findMany(),
    ])

    await writeCollection(db, 'projects', projects)
    await writeCollection(db, 'projectTranslations', projectTranslations)
    await writeCollection(db, 'translations', translations)
    await writeCollection(db, 'settings', settings)
    await writeCollection(db, 'users', users)
    await writeCollection(db, 'contactSubmissions', contactSubmissions)
    await writeCollection(db, 'pages', pages)
    await writeCollection(db, 'pageSections', pageSections)
    await writeCollection(db, 'pageSectionTranslations', pageSectionTranslations)
    await writeCollection(db, 'media', media)

    console.log('Migration complete')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exitCode = 1
})
