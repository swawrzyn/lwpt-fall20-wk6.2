const app = getApp();

Page({
  data: {
    items: [],
    scrollInto: "",
    inputVal: "",
  },
  onLoad: function () {
    const Movies = new wx.BaaS.TableObject("movies");

    // Movies.find() returns a Promise
    Movies.find().then((result) => {
      // This is when the promise is RESOLVED (everything ok)
      // console.log("this will happen second.");
      // console.log("result from ifanr", result);
      this.setData({
        items: result.data.objects,
      });
    }, (error) => {
      // This is when the promise is REJECTED (something wrong happened)
      // console.log("it's an error!!", error);
    });

    // console.log("This will happen first!");
  },
  toMovie: function (e) {
    // console.log('after movie click', e);
    wx.navigateTo({
      // detail?id=fii23fi09r29038r3r290
      url: `detail?id=${e.currentTarget.id}`,
    });
  },
  inputChange: function (e) {
    this.setData({
      inputVal: e.detail.value,
    });
  },
  formReset: function () {
    const val = this.data.inputVal;

    if (val.trim() === "") return;
    const items = this.data.items;
    const nextId = items.length + 1;
    items.push({ id: nextId, name: val });
    this.setData({
      items,
    });
    setTimeout(() => {
      this.setData({
        scrollInto: `item-${nextId}`,
      });
    }, 250);
    this.setData({
      inputVal: "",
    });
  },
});
