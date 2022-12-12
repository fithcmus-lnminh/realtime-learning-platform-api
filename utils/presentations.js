class Presentations {
  constructor() {
    this.presentations = [];
  }

  addPresentation({ access_code, slides, current_slide }) {
    this.presentations.push({
      access_code,
      slides,
      current_slide,
    });
  }

  removePresentation(access_code) {
    this.presentations = this.presentations.filter(
      (presentation) => presentation.access_code !== access_code
    );
  }

  getPresentation(access_code) {
    return this.presentations.find(
      (presentation) => presentation.access_code === access_code
    );
  }
}

module.exports = { Presentations };
