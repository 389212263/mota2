cc.Class({
    extends: cc.Component,

    properties: {
        infoPanel: cc.Node,
        buttonPanel:cc.Node,
    },

    onLoad: function () {
        let scale = (cc.visibleRect.height - 426) / 2 / 104;

        let x = - cc.visibleRect.width / 2;
        let y = cc.visibleRect.height / 2;
        this.infoPanel.scale = scale;
        this.infoPanel.setPosition(x,y);
        this.buttonPanel.scale = scale;
    },

    // update: function (dt) {

    // },
});
