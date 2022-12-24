class Viewers {
  constructor() {
    this.viewers = [];
  }

  addViewer({ access_code, id, type }) {
    this.viewers.push({
      access_code,
      id,
      type
    });
  }

  getViewer(access_code, id) {
    return this.viewers.find(
      (viewer) => viewer.access_code === access_code && viewer.id === id
    );
  }

  getViewers(access_code) {
    return this.viewers.filter((viewer) => viewer.access_code === access_code);
  }

  getTotalUsers(access_code) {
    return this.getViewers(access_code).length;
  }

  removeViewer(access_code, id) {
    this.viewers = this.viewers.filter(
      (viewer) => viewer.access_code !== access_code || viewer.id !== id
    );
  }
}

module.exports = new Viewers();
