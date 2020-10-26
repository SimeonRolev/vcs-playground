const textColorPrimary = "#333"

const respondTo = (size, content) => `
  @media screen and (max-width: ${size}) {
    ${content}
  }
`

const styles = `
    .tagsinput__wrapper {
        background-color: ${textColorPrimary}
    }

    .tagsinput__tag {
        background-color: white
    }
`

document.head.appendChild(
    document.createElement('style')
).textContent = styles;
