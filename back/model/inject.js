
function inject(con){
    require('./credential').inject(con);
    require('./post').inject(con);
    require('./upload').inject(con);
    require('./user').inject(con);
}

module.exports = inject;
