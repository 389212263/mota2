module.exports = {
    loadMonsterData(cb) {
        let url = 'json1';
        cc.loader.loadRes(url, (err, data) => {
            if (err) {
                cc.error(err);
                return;
            };

            let arr1 = data[0];
            let hp = parseFloat(arr1.HP);
            return cb();
        })
    },

};

