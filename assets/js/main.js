
window.onload = function(){
    ajaxCallBack("assets/data/books.json","get",(result)=>{
        
        // var knjige = result.filter(x=>x.reviews.stars==5 && x.reviews.reviewsNumber >15000);
        // //console.log(knjige);
        // knjige.sort((a,b)=>{
        //     return b.reviews.reviewsNumber - a.reviews.reviewsNumber
        // })
        result.sort((a,b)=>{
            return a.reviews.reviewsNumber - b.reviews.reviewsNumber
        })


        console.log(result)
    })
}

function ajaxCallBack(link,metod,result){
    $.ajax({
        url:link,
        method:metod,
        dataType:"json",
        success:result
    })
}