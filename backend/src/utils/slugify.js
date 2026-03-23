// FILE: backend/src/utils/slugify.js
const slugifyText = (value = '') => {
  const base = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || `item-${Date.now()}`
}

const uniqueSlugForModel = async (Model, seedValue, excludeId = null) => {
  const base = slugifyText(seedValue)
  let candidate = base
  let counter = 1

  while (
    await Model.exists(
      excludeId
        ? { slug: candidate, _id: { $ne: excludeId } }
        : { slug: candidate }
    )
  ) {
    candidate = `${base}-${counter}`
    counter += 1
  }

  return candidate
}

module.exports = {
  slugifyText,
  uniqueSlugForModel,
}