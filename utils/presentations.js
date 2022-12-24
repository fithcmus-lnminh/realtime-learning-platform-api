class Presentations {
  constructor() {
    this.presentations = [];
  }

  addPresentation({
    _id,
    title,
    access_code,
    slides,
    current_slide,
    group_id
  }) {
    this.presentations.push({
      _id,
      title,
      access_code,
      slides,
      current_slide,
      group_id
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

  getPresentationByGroup(group_id) {
    return this.presentations.find(
      (presentation) => presentation.group_id == group_id
    );
  }
}

module.exports = new Presentations();
