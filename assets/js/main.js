var url = location.pathname;
var prefersDarkScheme

window.onload = function(){

    // Setting the theme
    setThemeClass()

    // Loading and setting the navigation menu
    ajaxCallBack("links.json",(result)=>{
        setItemToLocalStorage("allLinks",result);
        displayHeader(result);
        displayPhoneNavgation(result);
        displayFooter(result);
    })

    if(url == "/index.html" || url == "/"){

        // Loading all necessary data for this page
        ajaxCallBack("books.json",function(books){
            ajaxCallBack("categories.json",function(categories){
                ajaxCallBack("authors.json",function(authors){
                    setItemToLocalStorage("allBooks",books);
                    setItemToLocalStorage("allCategories",categories);
                    setItemToLocalStorage("allAuthors",authors);

                    // Selectiong top 10 bestelling books
                    let bestselling = books.sort((a, b) => b.reviews.reviewsNumber - a.reviews.reviewsNumber);
                    let top10 = bestselling.slice(0, 20);
                    sectionGenerator('bestselling-books',"bestselling-books-articles-container","Bestselling Books",bookArticleGenerator,top10,"books");

                    // Displaying all categories that we offer
                    sectionGenerator('popular-categories',"popular-categories-articles-container","Popular Categories",categoryArticleGenerator,categories,"category");

                    // Displaying suggested books
                    
                    window.addEventListener("scroll",()=>{
                        let element = document.getElementById("position");
                        let scrollPosition = window.scrollY;

                        let positionOffset = element.getBoundingClientRect().top + scrollPosition;
                        if(scrollPosition > positionOffset){
                            if(getItemFromLocalStorage("userPreferedCategories")){
                                let element = document.querySelector("#sugested-books-articles-container");
                                if(element!= undefined)return;
                                displaySuggestions()
                            }else{
                                let exist = document.querySelector(".choosing-categories-section");
                                if(exist != undefined){
                                    return;
                                }
                                $("body").addClass("pre-loader");
                                let body = document.querySelector("body");
                                
                                let bodyChildren = body.children;
                                for(let i=0;i<bodyChildren.length;i++){
                                    bodyChildren[i].classList.add("blur");
                                }



                                let titleTag = document.createElement("h2");
                                titleTag.innerText = "Select 3 categories that match your interests"

                                let choosingCategoriesSection = document.createElement("section");
                                let choosingCategoriesContainer = document.createElement("div");

                                choosingCategoriesContainer.appendChild(titleTag);

                                choosingCategoriesSection.classList.add("choosing-categories-section");
                                choosingCategoriesContainer.classList.add("choosing-categories-container");

                                displayChoosingCategories(choosingCategoriesContainer);

                                choosingCategoriesSection.appendChild(choosingCategoriesContainer);
                                body.appendChild(choosingCategoriesSection);


                            }
                        }

                    })
                })
            })



        })

    }

    if(url.includes("/writer.html")){
        ajaxCallBack("books.json",function(books){
            ajaxCallBack("categories.json",function(categories){
                ajaxCallBack("authors.json",function(authors){
                    let parametar = window.location.href.split('?');
                    console.log(parametar);
                    let nameAndValue = parametar[1].split('=');
                    let id = nameAndValue[1];

                    displayWriter(id);

                    let allAuthorsLS = getItemFromLocalStorage("allAuthors");
                    let author = allAuthorsLS.find(x=>x.id == id);
                    let allAutorsBooks = books.filter(book=>book.idAuthor == author.id);

                    sectionGenerator("writer-books","writer-books-articles-container",`Books by ${author.name}`,bookArticleGenerator,allAutorsBooks,"books");

                    let uniqueCategoriesId = [];

                    allAutorsBooks.forEach(book=>{
                        book.category.forEach(cat=>{
                            if(!uniqueCategoriesId.includes(cat)){
                                uniqueCategoriesId.push(cat);
                            }
                        })
                    })

                    let uniqueCategories = []
                    uniqueCategoriesId.forEach(id=>{
                        let category = categories.find(x=> x.id == id);
                        uniqueCategories.push(category);
                    })


                    console.log(uniqueCategories);
                    sectionGenerator("writer-categories","writer-categories-articles-container","Related Categories",categoryArticleGenerator,uniqueCategories,"category");

                    sectionGenerator("other-writers","other-writers-articles-container","Check Out Other Authors",writerArticleGenerator,authors,"writer");
                })
            })
        })
    }


    if(url.includes("/book.html")){
        ajaxCallBack("books.json",function(books){
            ajaxCallBack("categories.json",function(categories){
                ajaxCallBack("authors.json",function(authors){
                    ajaxCallBack("publishers.json",function(publishers){
                        let parametar = window.location.href.split('?');
                        console.log(parametar);
                        let nameAndValue = parametar[1].split('=');
                        let id = nameAndValue[1];

                        setItemToLocalStorage("allPublishers",publishers);
    
                        displayBooksTextInfo(id);
                        displayBooksImage(id);

                        let book = books.find(x=>x.id == id);
                        let booksFromSameCategory = [];

                        let filteredBooks = books.filter(bookOne =>{
                            return bookOne.category.some(cat => book.category.some(sel=>{
                                return sel == cat;
                            }));
                        })

                        filteredBooks.sort((a, b) => 0.5 - Math.random());
                        let top20 = filteredBooks.slice(0, 20);

                        sectionGenerator("related-books","related-books-articles-container",`Related to ${book.name}`,bookArticleGenerator,top20,"books");


                        let authorsBooks = books.filter(x=>x.idAuthor == book.idAuthor);
                        authorsBooks.sort((a, b) => 0.5 - Math.random());

                        let author = authors.filter(x=>x.id == book.idAuthor);
                        console.log(author);

                        sectionGenerator("authors-books","autors-books-articles-container",`Read more from ${author[0].name}`,bookArticleGenerator,authorsBooks,"books")
                    })
                })
            })
        })
    }

}

function displayBooksImage(id){
    let allBooksLS = getItemFromLocalStorage("allBooks");
    let book = allBooksLS.find(x=>x.id == id);



    let containerDiv = document.createElement("div");
    containerDiv.setAttribute("id","container-div-image-and-price");

    let containerImgDiv = document.createElement("div");
    containerImgDiv.setAttribute("id","container-div-img");

    let lastDigit = id.toString().slice(-1);
    containerImgDiv.classList.add(`bg-article-color-${lastDigit}`);


    let imgTag = document.createElement("img");
    imgTag.src = `../assets/images/books/book${id}.jpg`;
    imgTag.alt = `${book.name}`;

    containerImgDiv.appendChild(imgTag);

    let divPrice = document.createElement("div");
    divPrice.setAttribute("id","price-container");

    let priceTag = document.createElement("p");
    priceTag.innerText = `$${book.price}`;
    
    divPrice.appendChild(priceTag);
    divPrice.innerHTML += `<i class="fa-solid fa-cart-shopping"></i>`;

    containerDiv.appendChild(containerImgDiv);
    containerDiv.appendChild(divPrice);

    let section = document.getElementById("book-info");
    section.appendChild(containerDiv);

}

function displayBooksTextInfo(id){
    let allBooksLS = getItemFromLocalStorage("allBooks");
    let allCategoriesLS = getItemFromLocalStorage("allCategories");
    let allWritersLS = getItemFromLocalStorage("allAuthors");
    let allPublishersLS = getItemFromLocalStorage("allPublishers");

    let book = allBooksLS.find(x=>x.id == id);
    let author = allWritersLS.find(x=>x.id == book.idAuthor);
    let publisher = allPublishersLS.find(x=>x.id == book.publisherId);
    
    let section = document.getElementById("book-info");

    // Creating title of the book
    let titleTag = document.createElement("h1");
    titleTag.innerText = book.name;

    section.appendChild(titleTag);

    // Create link for the author
    let writerLink = document.createElement("p");
    writerLink.setAttribute("id","writer-link")
    writerLink.innerHTML = `By <a href="writer.html?id=${book.idAuthor}">${author.name}</a>`;

    section.appendChild(writerLink);


    let starsDiv = document.createElement("div");
    starsDiv.setAttribute("id","stars");

    for(let i=0;i<5;i++){
        if(book.reviews.stars>i){
            starsDiv.innerHTML += `<i class="fa-solid fa-star"></i>`;
        }else{
            starsDiv.innerHTML += `<i class="fa-regular fa-star"></i>`;
        }
    }



    if(book.reviews.reviewsNumber > 0){
        starsDiv.innerHTML += `<p>${book.reviews.stars}/5 (<span class="text-bold">${book.reviews.reviewsNumber} ratings</span>)</p>`
    }else{
        starsDiv.innerHTML += `no ratings`;
    }

    section.appendChild(starsDiv);

    // Calling function for creating text about the book
    displayTextAboutBook(book);

    let relatedCategories = document.createElement("div");
    relatedCategories.setAttribute("id","book-related-categories");

    let bookCategories = [];
    for(let i=0;i<book.category.length;i++){
        let category = allCategoriesLS.find(x=>x.id == book.category[i]);
        bookCategories.push(category);
    }

    let conDiv = document.createElement("div");
    conDiv.setAttribute("id","related-categories-container")
    conDiv.classList.add("section-articles");
    section.appendChild(conDiv);

    // let relatedCategoriesContainer = document.createElement("div");
    // relatedCategoriesContainer.setAttribute("id","related-categories-container-inner");
    // relatedCategoriesContainer.classList.add("section-articles")
    // conDiv.appendChild(relatedCategoriesContainer);

    sectionGenerator("related-categories-container","book-related-categories-section","Related Categories",categoryArticleGenerator,bookCategories,"category");

    let divInfoSection = document.createElement("div");
    divInfoSection.classList.add("section-articles")
    divInfoSection.setAttribute("id","div-info-section");
    section.appendChild(divInfoSection);

    // let publisher = p

    let dataInfo = [
        ["Pages",book.pagesNumber],
        ["Publisher",publisher.name],
        ["Release Date",book.releaseDate]
    ];

    sectionGenerator("div-info-section","div-info-container","Info",infoArticleGenerator,dataInfo,"info");

}

function displayTextAboutBook(book){
    let section = document.getElementById("book-info");

    let textContainer = document.createElement("div");
    textContainer.setAttribute("id","text-container-about");
    let heading = document.createElement("h2");
    heading.innerText = "About this book";

    textContainer.appendChild(heading);
    for(let i=0;i<book.description.length;i++){
        let pTag = document.createElement("p");
        pTag.innerText = book.description[i]["text"];
        pTag.classList = book.description[i]["class"];

        textContainer.appendChild(pTag);
    }

    section.appendChild(textContainer);
}   

function displayWriter(id){
    let allAuthorsLS = getItemFromLocalStorage("allAuthors");

    let author = allAuthorsLS.find(x=>x.id == id);

    let writerInfoContainer = document.createElement("div");
    writerInfoContainer.setAttribute("id","writer-info-container");
    writerInfoContainer.classList.add("wrapper");

    let nameTag = document.createElement("h1");
    nameTag.innerText = author.name;

    let writerImg = document.createElement("img");
    writerImg.alt = author.name;
    writerImg.src = `../assets/images/authors/author${id}.jpg`;

    let shortInfo = document.createElement("p");
    shortInfo.classList.add("short-info");

    let words = author.about.split(" ");
    let shortString = words.slice(0,25).join(" ");
    shortInfo.innerText = shortString;

    let longInfo = document.createElement("p");
    longInfo.classList.add("long-info");
    longInfo.innerText = author.about ;

    let showMore = document.createElement("span");
    showMore.innerText = "Show More";

    let showLess = document.createElement("span");
    showLess.innerText = "Show Less";

    shortInfo.innerText += `...`;
    shortInfo.appendChild(showMore);

    longInfo.appendChild(showLess);
    
    longInfo.style.display = "none";

    showMore.addEventListener("click",()=>{
        let short = document.querySelector(".short-info");
        let long = document.querySelector(".long-info");

        short.style.display = "none";
        long.style.display = "block";
    });

    showLess.addEventListener("click",()=>{
        let short = document.querySelector(".short-info");
        let long = document.querySelector(".long-info");

        long.style.display = "none";
        short.style.display = "block";
    })


    writerInfoContainer.appendChild(nameTag)
    writerInfoContainer.appendChild(writerImg)
    writerInfoContainer.appendChild(shortInfo)
    writerInfoContainer.appendChild(longInfo)

    let section = document.getElementById("writer-info");

    section.appendChild(writerInfoContainer);
    
}

function displayChoosingCategories(element){
    
    let allCategoriesLS = getItemFromLocalStorage("allCategories");

    for(let i=0;i<allCategoriesLS.length;i++){
        let article = categoryArticleGenerator(allCategoriesLS[i].id);

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "checkbox-prefered-categories"
        checkbox.value = allCategoriesLS[i].id;
        checkbox.classList.add("category-checkbox-choose");
        checkbox.setAttribute("id",`prefered-category-${allCategoriesLS[i].id}`)

        $(document).on("change",`#prefered-category-${allCategoriesLS[i].id}`,settingUserPreferedCategories);

        article.appendChild(checkbox);
        element.appendChild(article);

    }

    return;
}

function settingUserPreferedCategories(){
    let checkBoxes = document.querySelectorAll(".category-checkbox-choose");

    let prefered = [];
    checkBoxes.forEach(function(checkbox){
        if (checkbox.checked) {
            prefered.push(checkbox.value);
          }
    })

    if(prefered.length == 3){
        setItemToLocalStorage("userPreferedCategories",prefered);
        let bodyChildren = document.querySelectorAll(".blur");
        for(let i=0;i<bodyChildren.length;i++){
            bodyChildren[i].classList.remove("blur");
            bodyChildren[i].classList.add("un-blur");
        }

        let body = document.querySelector("body");
        body.classList.remove("pre-loader")

        let section = document.querySelector(".choosing-categories-section");
        section.style.display = "none";
        displaySuggestions()

    }
}

function displaySuggestions(){
    let selectedCategories = getItemFromLocalStorage("userPreferedCategories");

    let allBooksLS = getItemFromLocalStorage("allBooks");

    let filteredBooks = allBooksLS.filter(book =>{
        return book.category.some(cat => selectedCategories.some(sel=>{
            return sel == cat;
        }));
    })


    filteredBooks.sort((a, b) => 0.5 - Math.random());
    let top20 = filteredBooks.slice(0, 20);
    sectionGenerator("suggested-books","sugested-books-articles-container","Books Recommended For You",bookArticleGenerator,top20,"books")

}

function infoArticleGenerator(array){
    let article = document.createElement("article");

    let heading = document.createElement("p");
    heading.classList.add("heading-info");
    let text = document.createElement("p");
    text.classList.add("text-bold");

    heading.innerText = array[0];
    text.innerText = array[1];

    article.appendChild(heading);
    article.appendChild(text);

    return article;
}

function categoryArticleGenerator(id){
    let article = document.createElement("article");

    let prefixCategoryImg;
    let prefixCategory;
    if(url == "/index.html" || url == "/"){
        prefixCategory = "pages/"
        prefixCategoryImg = ""
    }else{
        prefixCategoryImg = ".."
        prefixCategory = ""
    }

    let allBooksLS = getItemFromLocalStorage("allBooks");
    let allBooksFromThisCategory = allBooksLS.filter(x=>x.category.some(cat=>cat == id));

    let popularBook = allBooksFromThisCategory.reduce((acc,obj)=>{
        return obj.reviews.reviewsNumber > acc.reviews.reviewsNumber ? obj : acc;
    })

    let allCategories = getItemFromLocalStorage("allCategories");
    let name = allCategories.filter(x=>x.id == id)[0].name;

    let nameTag = document.createElement('p');
    nameTag.innerText = name;

    let imgTag = document.createElement("img");
    imgTag.src = prefixCategoryImg + `/assets/images/books/book${popularBook.id}.jpg`;
    imgTag.alt = popularBook.name;

    imgTag.classList.add("set-brightness");

    let link = document.createElement("a");
    link.href =prefixCategory + `shop.html?id=${id}`;

    article.classList.add("article-category");
    article.appendChild(link);
    article.appendChild(nameTag);
    article.appendChild(imgTag);

    article.classList.add("article-category");

    return article
}

function writerArticleGenerator(id){
    let allAuthorsLS = getItemFromLocalStorage("allAuthors");
    let allBooksLS = getItemFromLocalStorage("allBooks");



    let author = allAuthorsLS.find(x=>x.id == id);
    let numberOfTitles =0;

    allBooksLS.forEach(book=>{
        if(book.idAuthor == id)numberOfTitles++;
    });
    
    let article = document.createElement("article");
    article.classList.add("article-writer");

    let imgTag = document.createElement("img");
    imgTag.classList.add("set-brightness");
    imgTag.classList.add("article-writer-img");
    imgTag.src = `../assets/images/authors/author${author.id}.jpg`
    imgTag.alt = author.name;

    let nameTag = document.createElement("h3");
    nameTag.innerText = author.name;

    let numberTag = document.createElement("p");
    numberTag.innerText = numberOfTitles + " titles";

    let linkTag = document.createElement("a");
    linkTag.href = `writer.html?id=${id}`;

    article.appendChild(linkTag);
    article.appendChild(imgTag);
    article.appendChild(nameTag);
    article.appendChild(numberTag);

    return article;
}

function bookArticleGenerator(id,label,image){

    let prefixBookImg;
    let prefixAuthor;
    if(url == "/index.html" || url == "/"){
        prefixAuthor = "pages/"
        prefixBookImg = ""
    }else{
        prefixBookImg = ".."
        prefixAuthor = ""
    }


    let allBooksLS = getItemFromLocalStorage("allBooks");
    let allAuthorsLS = getItemFromLocalStorage("allAuthors");
    let book = allBooksLS.find(x=>x.id == id);
    let author = allAuthorsLS.find(x=>x.id == book.idAuthor);

    let article = document.createElement("article");
    article.classList.add("article-book");

    let divImgContainer = document.createElement("div");

    // Applying background class based on the last digit of the book's ID
    let lastDigit = id.toString().slice(-1);
    divImgContainer.classList.add(`bg-article-color-${lastDigit}`);
    divImgContainer.classList.add('article-div-img-container');

    // Creating img and setting its properties
    let bookImg = document.createElement("img");
    bookImg.classList.add("set-brightness");

    if(image){
        bookImg.src = prefixBookImg + `/assets/images/books/book${id}.jpg`;
    }
    bookImg.alt = book.name;

    // Creating container for the text part of the article (title, author, stars, cart)
    let divTextConatiner = document.createElement("div");
    divTextConatiner.classList.add("article-books-text-container");

    let divTitleAndAuthor = document.createElement("div");
    divTitleAndAuthor.classList.add("title-and-author");

    let titleTag = document.createElement("h3");
    let authorTag = document.createElement("a");
    authorTag.classList.add("author-link");
    authorTag.href = prefixAuthor + `writer.html?id=${book.idAuthor}`;
    authorTag.innerText = author.name;
    titleTag.innerText = book.name;

    divTitleAndAuthor.appendChild(titleTag);
    divTitleAndAuthor.appendChild(authorTag);

    let divStarsAndCart = document.createElement("div");
    divStarsAndCart.classList.add("stars-and-cart-container");

    let cartTag = document.createElement("i");
    cartTag.classList.add('fa-solid','fa-cart-shopping','shopping-cart');
    cartTag.setAttribute("id",'book-id-'+book.id);

    // Adding the click event on the icon
    $(document).on("click",`#book-id-`+book.id,()=>{
        addToCart(book.id);
    });

    let divStarsContainer = document.createElement("div");
    divStarsContainer.classList.add("stars-container");
    for(let i=0;i<5;i++){
        if(book.reviews.stars >i){
            divStarsContainer.innerHTML +='<i class="fa-solid fa-star"></i>'
        }else{
            divStarsContainer.innerHTML +='<i class="fa-regular fa-star"></i>'
        }
    }

    let rewievNumber = document.createElement("p");
    rewievNumber.classList.add("rating-text")
    if(book.reviews.stars>0){
        rewievNumber.innerText=`${book.reviews.stars}/5`
    }else{
        rewievNumber.innerText= "0 ratings";
    }

    divStarsAndCart.appendChild(cartTag);
    divStarsAndCart.appendChild(divStarsContainer);
    divStarsAndCart.appendChild(rewievNumber);

    divTextConatiner.appendChild(divTitleAndAuthor);
    divTextConatiner.appendChild(divStarsAndCart);

    // Adding link tag to a page for a single book

    let linkToABookTag = document.createElement("a");
    linkToABookTag.classList.add("link-to-single-a-book");
    linkToABookTag.href = prefixAuthor + `book.html?id=${book.id}`;

    divImgContainer.appendChild(bookImg);
    article.appendChild(divImgContainer);
    article.appendChild(divTextConatiner);
    article.appendChild(linkToABookTag);


    return article;
}

function sectionGenerator(locationId,setId,heading,callback,data,typeOfArticle){

    let articleWidth;
    let articleGap;

    let section = document.getElementById(locationId);



    let headingTag = document.createElement("h2");
    headingTag.innerText = heading;
    headingTag.classList.add("section-heading");



    let articleContainerTag = document.createElement("div");
    articleContainerTag.classList.add("article-container");
    articleContainerTag.setAttribute("id",setId);

    for(let i=0; i<data.length;i++){
        let article;

        if(typeOfArticle == "books"){
           article = callback(data[i].id,false,true);
           articleWidth = 180;
           articleGap = 40;
           articleContainerTag.classList.add("article-book-container");
        }else if(typeOfArticle == "category"){
           article = callback(data[i].id);
           articleWidth = 250;
           articleGap = 20;
           articleContainerTag.classList.add("article-category-container");
        }else if(typeOfArticle == "info"){
            article = callback(data[i]);
            articleWidth = 220;
            articleGap = 20;
            articleContainerTag.classList.add("article-info-container");
        }
        else{

            let parametar = window.location.href.split('?');
            let nameAndValue = parametar[1].split('=');
            let idSkip = nameAndValue[1];
        
            if(data[i].id == idSkip)continue;

            article = callback(data[i].id);
            articleWidth = 180;
            articleGap = 40;
            articleContainerTag.classList.add("article-author-container");
        }


        articleContainerTag.appendChild(article);
    }

    section.appendChild(headingTag);
    section.appendChild(articleContainerTag);

    // Adding scrolling functionality

    // Creating left and right angle container
    let leftAngleDiv = document.createElement("div");
    let rightAngleDiv = document.createElement("div");
    
    leftAngleDiv.setAttribute("id",setId + "-left-angle-container");
    rightAngleDiv.setAttribute("id",setId + "-right-angle-container");

    leftAngleDiv.classList.add("angle-container");
    rightAngleDiv.classList.add("angle-container");

    // Addiing left and right angle icons
    leftAngleDiv.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
    rightAngleDiv.innerHTML = '<i class="fa-solid fa-angle-right"></i>';

    leftAngleDiv.style.left = '-20px';
    rightAngleDiv.style.right = '-20px';

    leftAngleDiv.style.bottom = (articleContainerTag.offsetHeight/2 -20) + "px";
    rightAngleDiv.style.bottom = (articleContainerTag.offsetHeight/2 -20) + "px";

    if(typeOfArticle =="writer"){
        console.log(articleContainerTag);
        console.log(articleContainerTag.offsetHeight);
    }

    section.appendChild(leftAngleDiv);
    section.appendChild(rightAngleDiv);

    checkAngleVisibility(setId,`${setId}-left-angle-container`,`${setId}-right-angle-container`);



    $(document).on("click",`#${setId}-left-angle-container`,()=>{
        scrollLeft(setId,articleWidth,articleGap,`${setId}-left-angle-container`,`${setId}-right-angle-container`);
    });
    $(document).on("click",`#${setId}-right-angle-container`,()=>{
        scrollRight(setId,articleWidth,articleGap,`${setId}-left-angle-container`,`${setId}-right-angle-container`);
        
    });

    $(document).on("wheel",`#${setId}`,()=>{
        checkAngleVisibility(setId,`${setId}-left-angle-container`,`${setId}-right-angle-container`);
    })

    window.addEventListener("resize",()=>{
        checkAngleVisibility(setId,`${setId}-left-angle-container`,`${setId}-right-angle-container`);
    })
}

function scrollRight(id,articleWidth,gap,idLeft,idRight){
    let container = document.getElementById(id);
    let widthOfAnArticle = articleWidth + gap;
    
    let widthScrolled = Math.ceil(container.scrollLeft/widthOfAnArticle) * widthOfAnArticle;
    let articlesThatCanFit = Math.floor(container.clientWidth/widthOfAnArticle) * widthOfAnArticle;

    container.scrollLeft = widthScrolled+ articlesThatCanFit;

    let leftAngle = document.getElementById(idLeft);
    leftAngle.style.display = "grid";
    let rightAngle = document.getElementById(idRight);
    if((container.scrollWidth-container.clientWidth) <= widthScrolled+ articlesThatCanFit){
        rightAngle.style.display = "none";
    }else{
        rightAngle.style.display = "grid";
    }


}

function scrollLeft(id,articleWidth,gap,idLeft,idRight){
    let container = document.getElementById(id);
    let widthOfAnArticle = articleWidth + gap;

    // Since we don't have propery .scrollRight, we created one 
    let scrollRightWidth = container.scrollWidth - container.scrollLeft - container.clientWidth;

    let articlesThatCanFit = Math.floor(container.clientWidth/widthOfAnArticle) * widthOfAnArticle;
    let rightWidthScrolled = Math.ceil(scrollRightWidth/widthOfAnArticle) * widthOfAnArticle;


    container.scrollLeft =container.scrollWidth - (rightWidthScrolled + articlesThatCanFit + container.clientWidth) ;

    let rightAngle = document.getElementById(idRight);
    rightAngle.style.display = "grid";
    let leftAngle = document.getElementById(idLeft);
    
    if((container.scrollWidth - (rightWidthScrolled + articlesThatCanFit + container.clientWidth))<=0){
        leftAngle.style.display = "none";
    }else{
        leftAngle.style.display = "grid";
    }
}

function checkAngleVisibility(idElement,idLeft,idRight){
    let container = document.getElementById(idElement);

    let leftAngle = document.getElementById(idLeft);
    let rightAngle = document.getElementById(idRight);

    if(container.scrollLeft == 0){
        leftAngle.style.display = "none";
    }else{
        leftAngle.style.display = "grid";
    }

    if((container.scrollWidth - (container.scrollLeft + container.clientWidth)) >0 ){
        rightAngle.style.display = "grid";
    }else{
        rightAngle.style.display = "none";
    }
}

function addToCart(id){
    console.log("dodato u korpu " + id);
}

function setThemeClass(){
    prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    let currentTheme = getItemFromLocalStorage("theme");

    if (currentTheme == "dark") 
    {
        document.body.classList.toggle("dark-mode");
    } 
    else if (currentTheme == "light") 
    {
        document.body.classList.toggle("light-mode");
    }
    else if(prefersDarkScheme.matches){
        document.body.classList.toggle("dark-mode");
    }else{
        document.body.classList.toggle("light-mode");
    }
}

function displayFooter(result){
    displayNavigation(result.documents,"footer","docements-links",false,true);
    displayNavigation(result.socialMedia,"footer","social-media-links",true,false);
    displayNavigation(result.pages,"footer","pages-links",false,false);
}

function displayHeader(result){

    // define prefix for url based on current page
    let preUrl = "";
    if(!(url=="/index.html" || url=="/")){
        preUrl ="../";
    }

    // header content
    let header = document.getElementById('header');

    //create elements for logo

    let logoLink = document.createElement('a');
    let logoSlika = document.createElement('img');

    logoLink.setAttribute('href',preUrl +"index.html");

    logoSlika.src = preUrl + "assets/images/logo.png";
    logoSlika.alt =  "logo";

    logoLink.appendChild(logoSlika);
    header.appendChild(logoLink);

    //function that creates elements for links
    displayNavigation(result.pages,"header","header-navigation",false,false);
    displayActiveLink();


    //create icons for dark/light mode and cart 
    var divIcons = document.createElement("div");
    divIcons.setAttribute("id","icons-container");

    ajaxCallBack("icons.json",(result)=>{

        for(let i=0;i<result.length;i++){
            let iTag = document.createElement("i");
            
            for(let j=0;j<result[i].class.length;j++){
                iTag.classList.add(result[i].class[j]);
            }
            iTag.setAttribute("id",result[i].id);

            divIcons.appendChild(iTag);
        }

        $(document).on("click","#menu-icon-open",openPhoneNavigation);
        $(document).on("click","#dark-mode-icon",toggleTheme);
        $(document).on("click","#light-mode-icon",toggleTheme);

        header.appendChild(divIcons);

        toggleThemeIcon();
    })

    
}

function displayActiveLink(){
    // displays currently active link

    let ul = document.getElementById("header-navigation");
    let links = ul.querySelectorAll("a");

    links.forEach(link => {
        let href = link.getAttribute("href");
        if(window.location.href.includes(href)){
            link.setAttribute("id","active-link");
        }
    })
}

function closePhoneNavigation(){

    let phoneNav = document.querySelector(".phone-nav");
    phoneNav.classList.remove("nav-entering");
    phoneNav.classList.add("nav-leaving");


    setTimeout(() => {
        $("body").removeClass("pre-loader");
        phoneNav.classList.remove("display-phone-nav");

    }, 450);
}

function openPhoneNavigation(){
    let phoneNav = document.querySelector(".phone-nav");

    $("body").addClass("pre-loader");

    phoneNav.classList.add("display-phone-nav");
    phoneNav.classList.add("nav-entering");
    phoneNav.classList.remove("nav-leaving");
}

function toggleThemeIcon(){
    let light = document.getElementById("light-mode-icon");
    let dark = document.getElementById("dark-mode-icon");

    if(document.body.classList.contains("light-mode")){
        dark.style.display= "block";
        light.style.display = "none";
    }else{
        light.style.display= "block";
        dark.style.display = "none";
    }

}

function toggleTheme(){



    let theme;

    if(document.body.classList.contains("light-mode")){
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        toggleThemeIcon()
        theme = "dark";
    }else{
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        toggleThemeIcon()
        theme = "light"
    }

    setItemToLocalStorage("theme", theme);
}

function displayPhoneNavgation(result){
    let phoneNavDiv = document.getElementById("phone-nav-id");

    displayNavigation(result.pages,"phone-nav-id","phone-nav-ul",false,false);

    let closeIconTag = document.createElement("i");
    closeIconTag.setAttribute("id","menu-icon-close")
    closeIconTag.classList.add("fa-solid");
    closeIconTag.classList.add("fa-xmark");

    $(document).on("click","#menu-icon-close",closePhoneNavigation);

    phoneNavDiv.appendChild(closeIconTag);


}

function displayNavigation(linkArray,id,setId,isSocialMedia,isDocumentation){

    let elementId = document.getElementById(id);

    var ulTag = document.createElement('ul');

    ulTag.setAttribute("id",setId);

    for(let i=0; i<linkArray.length;i++){

        let liTag = document.createElement('li');
        let aTag  = document.createElement('a');

        if(isSocialMedia){
            aTag.href =linkArray[i].link;
            aTag.innerText = linkArray[i].name;
            aTag.setAttribute('target', '_blank');
        }        
        else if(url=="/index.html" || url=="/"){
            //checking the url of the page

            // setting prefix for the file location
            if(linkArray[i].name == "Home" || isDocumentation){
                aTag.href =linkArray[i].link;
                aTag.innerText = linkArray[i].name;
            }else{
                aTag.href = "pages/" + linkArray[i].link;
                aTag.innerText = linkArray[i].name;
            }


        }else{

            // setting prefix for the file location
            if(linkArray[i].name == "Home" || isDocumentation){
                aTag.href ="../" + linkArray[i].link;
                aTag.innerText = linkArray[i].name;
            }else{
                aTag.href = linkArray[i].link;
                aTag.innerText = linkArray[i].name;
            }
        }

        liTag.appendChild(aTag);
        ulTag.appendChild(liTag);


    }

    elementId.appendChild(ulTag);
}

function getItemFromLocalStorage(name){
    let item =JSON.parse(localStorage.getItem(name));
    return item;
}

function setItemToLocalStorage(name,value){
    localStorage.setItem(name,JSON.stringify(value));
}

function ajaxCallBack(file,result){

    let link;
    if(url=="/index.html" || url=="/"){
        link ="assets/data/";
    }else{
        link = "../assets/data/";
    }

    link += file;

    $.ajax({
        url:link,
        method:"get",
        dataType:"json",
        success:result
    })
}