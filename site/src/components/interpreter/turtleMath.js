const turtleMath = {
    cosdeg: function(x){
        return Math.cos(x * 2 * Math.PI / 360); 
    },

    rad: function(a){
        return a * 2 * Math.PI / 360;
    },

    sindeg: function(x){
        return Math.sin(x*2*Math.PI/360);
    },

    deg: function(a){
        return a * 360 / (2 * Math.PI);
    }
}

export default turtleMath;