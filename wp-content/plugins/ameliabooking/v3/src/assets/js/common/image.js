let usedColors = []
let colors = [
  '1788FB',
  '4BBEC6',
  'FBC22D',
  'FA3C52',
  'D696B8',
  '689BCA',
  '26CC2B',
  'FD7E35',
  'E38587',
  '774DFB',
  '31CDF3',
  '6AB76C',
  'FD5FA1',
  'A697C5'
]

function pictureLoad (baseUrls, entity, isPerson) {
  if (entity !== null) {
    let name = isPerson === true ? entity.firstName + ' ' + entity.lastName : entity.name
    if (typeof name !== 'undefined') {
      entity.pictureThumbPath = entity.pictureThumbPath || imageFromText(baseUrls, name)
      return entity.pictureThumbPath
    }
  }
}

function  getNameInitials (name) {
  return name.split(' ').map((s) => s.charAt(0)).join('').toUpperCase().substring(0, 3).replace(/[^\w\s]/g, '')
}

function imageFromText (baseUrls, name, entity = {}, error = false) {
  let initials = getNameInitials(name)
  let colorIndex = Math.floor(Math.random() * colors.length)
  let colorHex = colors[colorIndex]
  usedColors.push(colors[colorIndex])
  colors.splice(colorIndex, 1)
  if (colors.length === 0) {
    colors = usedColors
    usedColors = []
  }
  if (error) {
    if (entity.firstName) {
      return baseUrls.wpAmeliaPluginURL + 'public/img/default-employee.svg'
    }
    if (entity.latitude) {
      return baseUrls.wpAmeliaPluginURL + 'public/img/default-location.svg'
    }
    return baseUrls.wpAmeliaPluginURL + 'public/img/default-service.svg'
  }
  return location.protocol + '//via.placeholder.com/120/' + colorHex + '/fff?text=' + initials
}

export {
  pictureLoad
}
