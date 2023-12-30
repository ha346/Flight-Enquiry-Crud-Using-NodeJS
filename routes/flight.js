var express = require('express');
var router = express.Router();
var pool = require('./pool');
var upload = require('./multer');
var fs = require('fs');
var LocalStorage = require("node-localstorage").LocalStorage;
var localStorage = new LocalStorage('./scratch');



router.get('/search', function (req, res) {
    
    res.render('searchflights')
})

router.get('/searchflight', function (req, res) {
    
    
    pool.query("select F.*, (select C.cityname from city C where C.cityid=F.sourcecityid) as sc, (select C.cityname from city C where C.cityid=F.destinationcityid) as dc  from flights F where F.sourcecityid=? and F.destinationcityid=?", [req.query.sid, req.query.did], function (error, result) {
        
        if (error)
        {
            res.status(500).json([])
        }
        else
        {
            res.status(200).json(result)
        }
    })
})
  
 

router.get('/showpicture', function (req, res) {
    
    res.render('showpicture',{flightid:req.query.flightid,companyname:req.query.companyname,logo:req.query.logo})
})

router.get('/displaybyid', function (req, res) {
    
    pool.query('select F.*,(select C.cityname from city C where C.cityid=F.sourcecityid) as sc,(select C.cityname from city C where C.cityid=F.destinationcityid) as dc,(select S.statename from states S where S.stateid=F.sourcestateid) as ss,(select S.statename from states S where S.stateid=F.destinationstateid) as ds from flights F where F.flightid=?', [req.query.flightid], function (error, result) {
        
        if (error)
        {
            console.log(error)
        
            res.render('displaybyflightid', { data: [] });
        }
        else {
            console.log(result)
            res.render('displaybyflightid', { data: result[0] });
        }
    }) 
})

router.get('/displayall', function (req, res) {

    var result=JSON.parse(localStorage.getItem('admin'))
    if (!result)
    {
        res.render('login',{msg:''})
        }
    pool.query('select F.*, (select C.cityname from city C where C.cityid=F.sourcecityid) as sc, (select C.cityname from city C where C.cityid=F.destinationcityid) as dc  from flights F', function (error, result) {
        
        if (error) {
            res.render('displayall', { data: [] });
        }
        else {
            res.render('displayall', { data: result });
        }
    });
    
     
});

router.get('/addnewflights', function (req, res) {

    var result = JSON.parse(localStorage.getItem('admin'));
    // console.log("XXXXXXXXXX",result)

    if (result) {
    
        res.render('addnewflights', { msg: '' });
    }
    else
    {
        res.render('login',{msg:''})
        }
});


router.get('/fetchallstates', function (req, res) {
    
    pool.query('select * from states', function (error, result) {
        
        if (error) {
            res.status(500).json([])
        }
        else {
            
            res.status(200).json(result)
        }
    });
});

router.get('/fetchallcity', function (req,res) {
    pool.query('select * from city where stateid=?', [req.query.stateid], function (error, result) {
        
        if (error) {
            
            res.status(500).json([])
        }
        else {
            res.status(200).json(result)
        }
    })
})

router.post('/addnewrecords',upload.single('logo'), function (req, res) {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    var fclass;
    if (Array.isArray(req.body.fclass))
    {
      fclass = req.body.fclass.join(',')
    }
    else
    {
        fclass=req.body.fclass
        }

    var days;
    if (Array.isArray(req.body.fdays))    // if we choose only sunday and join function didn't work
    {
         days=req.body.fdays.join(',')
    }
    else
    {
        days = req.body.fdays;
        }
    
      
    pool.query("insert into flights(flightid,companyname,sourcestateid,sourcecityid,destinationstateid,destinationcityid,status,flightclass,sourcetiming,destinationtiming,days,logo)values(?,?,?,?,?,?,?,?,?,?,?,?)", [req.body.fid, req.body.fname, req.body.sourcestate, req.body.sourcecity, req.body.deststate, req.body.destcity, req.body.status,fclass, req.body.sourcetiming, req.body.destinationtiming,days, req.file.originalname], function (error, result) {
       
        if (error)
        {
            console.log(error)
          res.render('addnewflights',{msg:'Server Error,Record not submitted'})   //json is used for sending record to jquery
        }
        else {
             res.render('addnewflights',{msg:'Record Submitted Successfully'})
        }
   })
    console.log(req.body)
    
     
})


router.post('/editdeleterecord', function (req, res) {

    if (req.body.btn == 'Edit') {
        var fclass;
        if (Array.isArray(req.body.fclass)) {
            fclass = req.body.fclass.join('#')
        }
        else {
            fclass = req.body.fclass
        }

        var days;
        if (Array.isArray(req.body.fdays))    // if we choose only sunday and join function didn't work
        {
            days = req.body.fdays.join('#')
        }
        else {
            days = req.body.fdays;
        }
    
      
        pool.query("update flights set companyname=?,sourcestateid=?,sourcecityid=?,destinationstateid=?,destinationcityid=?,status=?,flightclass=?,sourcetiming=?,destinationtiming=?,days=? where flightid=?", [req.body.fname, req.body.sourcestate, req.body.sourcecity, req.body.deststate, req.body.destcity, req.body.status, fclass, req.body.sourcetiming, req.body.destinationtiming, days, req.body.fid], function (error, result) {
       
            if (error) {
                console.log(error)
                res.redirect('/flightnew/displayall')
            }
            else {
                res.redirect('/flightnew/displayall')
            }
        })
    }

    else
    {
        
        pool.query("delete from flights where flightid=?", [req.body.fid], function (error, result) {
       
            if (error) {
                console.log(error)
                res.redirect('/flightnew/displayall')
            }
            else {
                res.redirect('/flightnew/displayall')
            }
        })
        }
    console.log(req.body)

    
    
     
})

router.post('/editpicture', upload.single('logo'), function (req, res) {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    pool.query('update flights set logo=? where flightid=?', [req.file.originalname, req.body.flightid], function (error, result) {
        
        if (error)
        {
            res.redirect('/flightnew/displayall')
        }
        else
        {
            fs.unlinkSync("E:SappalSir's_Folder\Node Projects\flightenquirynew\public\images"+req.body.oldlogo)
            res.redirect('/flightnew/displayall')
        }
        

    })


})

module.exports = router;