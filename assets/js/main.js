var url = location.pathname;
var prefersDarkScheme

window.onload = function(){

    console.log("ispravka 7")
    // Setting the theme
    setThemeClass()

    // Loading and setting the navigation menu
    ajaxCallBack("links.json",(result)=>{
        setItemToLocalStorage("allLinks",result);
        displayHeader(result);
        displayPhoneNavgation(result);
        displayFooter(result);
    })

    if(url == "/Readily/index.html" || url == "/Readily/"){

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
                        let nameAndValue = parametar[1].split('=');
                        let id = nameAndValue[1];

                        setItemToLocalStorage("allPublishers",publishers);
    
                        displayBooksTextInfo(id);
                        displayBooksImage(id);

                        let book = books.find(x=>x.id == id);

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

                        sectionGenerator("authors-books","autors-books-articles-container",`Read more from ${author[0].name}`,bookArticleGenerator,authorsBooks,"books");

                        displayReviews(book)
                    })
                })
            })
        })
    }

    if(url.includes("/shop.html")){
        ajaxCallBack("categories.json",function(categories){
            ajaxCallBack("sort.json",function(sortOptions){
                setItemToLocalStorage("allCategories",categories);
                setItemToLocalStorage("allSortOptions",sortOptions)
                
                console.log(window.location.href);

                if(window.location.href.includes("html?id=")){

                    let partition = window.location.href.split("=");
                    let id = partition[1];

                    let userSearchPreferences = {
                        search:"",
                        priceMin:"",
                        priceMax:"",
                        categories:[id],
                        sort:"popular"
                    }
                    setItemToLocalStorage("userSearchPreferences",userSearchPreferences);
                }

                displayFilterSort();


            })
        })
    }

    
    if(url.includes("/checkout.html")){
        displayTableBody();
        
        setFormInfo();

        $(document).on("click",`#form-button`,(e)=>{
            e.preventDefault();
            formCheck();
        })

        $(document).on("blur",`#first-name`,firstNameValidation);
        $(document).on("blur",`#last-name`,lastNameValidation);
        $(document).on("blur",`#email-input`,emailValidetion);
        $(document).on("blur",`#phone-input`,phoneNumberValidation);
        $(document).on("blur",`#address-input`,addressValidation);
        $(document).on("change",`input[name=radio-delivery]`,deliveryTypeValidation);
        $(document).on("change",`#terms`,termsValidation);
    }
}



function formCheck(){
    let errorNumber=0;

    errorNumber +=cartLengthValidation() + emailValidetion()+phoneNumberValidation()+ lastNameValidation() +firstNameValidation() + addressValidation() + deliveryTypeValidation()  + termsValidation();

    console.log(errorNumber);
    if(!errorNumber){
        let userDeliveryInfo = {}

        userDeliveryInfo.firstName = document.getElementById("first-name").value;
        userDeliveryInfo.lastName = document.getElementById("last-name").value;
        userDeliveryInfo.email = document.getElementById("email-input").value;
        userDeliveryInfo.phone = document.getElementById("phone-input").value;
        userDeliveryInfo.address = document.getElementById("address-input").value;

        let radioTags = document.querySelectorAll("input[name=radio-delivery]");

        for(let i=0;i<radioTags.length;i++){
            if(radioTags[i].checked){
    
                userDeliveryInfo.deliveryType = radioTags[i].value;
            }
        }
        console.log(userDeliveryInfo)
        setItemToLocalStorage("userDeliveryInfo",userDeliveryInfo)
        document.getElementById("delivery-form").reset();

        setItemToLocalStorage("cartInfo",[]);

        let tbodyTag = document.querySelector("tbody");
        while(tbodyTag.firstChild)tbodyTag.firstChild.remove();
        displayTableBody();
    }
}

function setFormInfo(){
    let userDeliveryInfo = getItemFromLocalStorage("userDeliveryInfo");

    if(userDeliveryInfo != null){
        
        document.getElementById("first-name").value = userDeliveryInfo.firstName
        document.getElementById("last-name").value = userDeliveryInfo.lastName;
        document.getElementById("email-input").value = userDeliveryInfo.email;
        document.getElementById("phone-input").value = userDeliveryInfo.phone;
        document.getElementById("address-input").value = userDeliveryInfo.address;

        let radioTags = document.querySelectorAll("input[name=radio-delivery]")

        for(let i=0;i<radioTags.length;i++){
            if (radioTags[i].value == userDeliveryInfo.deliveryType) {
                radioTags[i].checked = true;
                break;
            }
        }
    }
}

function cartLengthValidation(){
    let cartInfo = getItemFromLocalStorage("cartInfo");

    console.log(cartInfo.length);
    if(cartInfo.length == 0){
        let errorMsg = document.getElementById("card-empty-msg");
        errorMsg.style.display = "block"
        return 1;
    }else{
        let errorMsg = document.getElementById("card-empty-msg");
        errorMsg.style.display = "none"
        return 0;
    }
}

function termsValidation(){
    let checkbox = document.querySelector("#terms");

    if(checkbox.checked){
        let errorMsg = document.getElementById("term-error");
        errorMsg.style.display = "none"
        return 0;
    }else{
        let errorMsg = document.getElementById("term-error");
        errorMsg.style.display = "block"
        return 1;
    }
}

function deliveryTypeValidation(){
    let radioTags = document.querySelectorAll("input[name=radio-delivery]");

    for(let i=0;i<radioTags.length;i++){
        if(radioTags[i].checked){

            let errorMsg = document.getElementById("radio-error");
            errorMsg.style.display = "none"
            return 0;
        }
    }

    let errorMsg = document.getElementById("radio-error");
    errorMsg.style.display = "block"
    return 1;
}

function addressValidation(){
    let addressRegex = /^[a-zA-Z0-9\s\,\.\-]{5,}$/;

    let address = document.getElementById("address-input").value;

    if(addressRegex.test(address)){
        let errorMsg = document.getElementById("address-error");
        errorMsg.style.display = "none"
        return 0;
    }else{
        let errorMsg = document.getElementById("address-error");
        errorMsg.style.display = "block"
        return 1;
    }
}

function phoneNumberValidation(){
    let phoneRegex = /^06\d{8}$/;

    let phone = document.getElementById("phone-input").value;

    if(phoneRegex.test(phone)){
        let errorMsg = document.getElementById("phone-error");
        errorMsg.style.display = "none"
        return 0;
    }else{
        let errorMsg = document.getElementById("phone-error");
        errorMsg.style.display = "block"
        return 1;
    }
}

function firstNameValidation(){
    let nameRegex = /^[A-ZŠĐĆČŽ][a-zšđčćž]{2,}( [A-ZŠĐĆČŽ][a-zšđčćž]{2,})*$/;

    let firstName = document.getElementById("first-name").value;
    if(nameRegex.test(firstName)){
        let errorMsg = document.getElementById("first-name-error");
        errorMsg.style.display = "none"
        return 0;
    }else{
        let errorMsg = document.getElementById("first-name-error");
        errorMsg.style.display = "block"
        return 1;
    }
}

function lastNameValidation(){
    let nameRegex = /^[A-ZŠĐĆČŽ][a-zšđčćž]{2,}( [A-ZŠĐĆČŽ][a-zšđčćž]{2,})*$/;

    let firstName = document.getElementById("last-name").value;
    if(nameRegex.test(firstName)){
        let errorMsg = document.getElementById("last-name-error");
        errorMsg.style.display = "none"
        return 0;
    }else{
        let errorMsg = document.getElementById("last-name-error");
        errorMsg.style.display = "block"
        return 1;
    }
}

function emailValidetion(){
    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    let email = document.getElementById("email-input").value;

    if(emailRegex.test(email)){
        let errorMsg = document.getElementById("email-error");
        errorMsg.style.display = "none"
        return 0;
    }else{
        let errorMsg = document.getElementById("email-error");
        errorMsg.style.display = "block"
        return 1;
    }
}



function displayTableBody(){
    let tbodyElement = document.querySelector("tbody");
    console.log(tbodyElement);

    ajaxCallBack("books.json",(books)=>{
        let cartInfo = getItemFromLocalStorage("cartInfo");

        console.log("broj " + cartInfo.length);
        if(cartInfo.length == 0){
            let trEmptyTag = document.getElementById("empty");
            trEmptyTag.style.display = "block"
        }else{
            
            let trEmptyTag = document.getElementById("empty");
            trEmptyTag.style.display = "none";
        }

        for(let i=0;i<cartInfo.length;i++){
            let book = books.find(x=>x.id == cartInfo[i].id);
            let trTag = document.createElement("tr");
            trTag.setAttribute("id",`tr-${book.id}`);

            let imgTag = document.createElement("img");
            imgTag.classList.add("set-brightness");
            imgTag.src = `../assets/images/books/book${book.id}.jpg`;
            imgTag.alt = book.name;

            let tdTagImg = document.createElement("td")
            tdTagImg.classList.add("td-image");
            tdTagImg.appendChild(imgTag);

            let titleTag = document.createElement("p");
            titleTag.innerText = book.name;

            let titleContainer = document.createElement("div");
            titleContainer.appendChild(titleTag);

            let tdTitle = document.createElement("td");
            tdTitle.classList.add("td-title")
            tdTitle.appendChild(titleContainer)

            let unitPriceTag = document.createElement("p");
            unitPriceTag.innerText = `$${book.price}`;
            
            let tdUnitPriceTag = document.createElement("td");
            tdUnitPriceTag.classList.add("td-unit-price")
            tdUnitPriceTag.appendChild(unitPriceTag);

            let quantityTag = document.createElement("input");
            quantityTag.setAttribute("min","0");
            quantityTag.type = "number";
            quantityTag.setAttribute("id",`quantity-${book.id}`);
            quantityTag.value = `${cartInfo[i].quantity}`;



            let quantityTagContainer = document.createElement("div");
            quantityTagContainer.appendChild(quantityTag);

            let tdQuantity = document.createElement("td");
            tdQuantity.classList.add("td-quantity");
            tdQuantity.appendChild(quantityTagContainer)


            let priceTag = document.createElement("p");
            priceTag.setAttribute("id",`price-${book.id}`);
            priceTag.innerText = "$" + (book.price * cartInfo[i].quantity).toFixed(2);

            let tdPrice = document.createElement("td");
            tdPrice.classList.add("td-price");
            tdPrice.appendChild(priceTag)

            let removeTag = document.createElement("i");
            removeTag.classList.add("fa-solid","fa-xmark");
            removeTag.setAttribute("id",`remove-${book.id}`);

            let removeTagContainer = document.createElement("div");
            removeTagContainer.appendChild(removeTag);

            let tdRemove = document.createElement("td");
            tdRemove.classList.add("td-remove");

            tdRemove.appendChild(removeTagContainer);

            trTag.appendChild(tdTagImg);
            trTag.appendChild(tdTitle);
            trTag.appendChild(tdUnitPriceTag);
            trTag.appendChild(tdQuantity);
            trTag.appendChild(tdPrice);
            trTag.appendChild(tdRemove);

            tbodyElement.appendChild(trTag);

            $(document).on("click",`#remove-${book.id}`,()=>{
                let cartInfo = getItemFromLocalStorage("cartInfo");
                

                for(let i=0;i<cartInfo.length;i++){
                    if(cartInfo[i].id == book.id){
                        cartInfo.splice(i,1);
                    }
                }

                let trTag = document.getElementById(`tr-${book.id}`);
                trTag.remove();

                setItemToLocalStorage("cartInfo",cartInfo)
                setTotalPrice();

                if(cartInfo.length == 0){
                    let trEmptyTag = document.getElementById("empty");
                    trEmptyTag.style.display = "block"


                }else{
                    let trEmptyTag = document.getElementById("empty");
                    trEmptyTag.style.display = "none"
                }
            })

            $(document).on("change",`#quantity-${book.id}`,()=>{
                console.log(book);
                let pQuantity = document.getElementById(`price-${book.id}`);
                let quantityValue = document.getElementById(`quantity-${book.id}`).value;

                let cartInfo = getItemFromLocalStorage("cartInfo");
                console.log(cartInfo);
                for(let i=0;i<cartInfo.length;i++){
                    if(cartInfo[i].id == book.id){
                        if(Number(quantityValue) != "0"){
                            cartInfo[i].quantity = quantityValue;
                            pQuantity.innerText = `$`+ (book.price * cartInfo[i].quantity).toFixed(2);

                        }else{
                            cartInfo.splice(i,1);
                            let trTag = document.getElementById(`tr-${book.id}`);
                            trTag.remove();
                        }
                    }
                }

                if(cartInfo.length == 0){
                    let trEmptyTag = document.getElementById("empty");
                    trEmptyTag.style.display = "block"


                }else{
                    let trEmptyTag = document.getElementById("empty");
                    trEmptyTag.style.display = "none"
                }

                setItemToLocalStorage("cartInfo",cartInfo)
                setTotalPrice();
            })
        }
        setTotalPrice()
        $("table tr:odd").css("background-color","var(--table-tr-bg)")
    })
}

function setTotalPrice(){
    let totalPriceTag = document.getElementById("total-price");
    let allBookLS =  getItemFromLocalStorage("allBooks");
    let cartInfo = getItemFromLocalStorage("cartInfo")

    let total =0;

    for(let i=0;i<cartInfo.length;i++){
        let book = allBookLS.find(x=>x.id == cartInfo[i].id);

        total += book.price * cartInfo[i].quantity;
    }

    totalPriceTag.innerText = `Total: $${total.toFixed(2)}`;
    
}

function addToCart(id){
    let cartInfo = getItemFromLocalStorage("cartInfo");

    if(cartInfo == null){
        cartInfo = [];
    }

    let item = cartInfo.find(x=>x.id == id);

    if(item == null){
        item = {
            id : id,
            quantity:1
        }
        cartInfo.push(item);
    }else{
        console.log(item);
        console.log(item.quantity)
        item.quantity++;
    }
    setItemToLocalStorage("cartInfo",cartInfo);
    
    console.log("dodato u korpu " + id);
}

function displayFilterSort(){
    let allCategoriesLS = getItemFromLocalStorage("allCategories");
    let allSortOptionsLS = getItemFromLocalStorage("allSortOptions");

    let categoriesContainer = document.getElementById("categories-option");

    for(let i=0;i<allCategoriesLS.length;i++){
        let inputContainer = document.createElement("div");
        inputContainer.classList.add("checkbox-container");

        let labelTag = document.createElement("label");
        labelTag.htmlFor = allCategoriesLS[i].id;
        labelTag.innerText = allCategoriesLS[i].name

        let inputTag = document.createElement("input");
        inputTag.setAttribute("id",allCategoriesLS[i].id);
        inputTag.name = "categories";
        inputTag.type = "checkbox";

        $(document).on("change",`#${inputTag.id}`,()=>{
            collectUserSearchPreferences()
            displayShopArticles();
        })

        inputContainer.appendChild(inputTag);
        inputContainer.appendChild(labelTag);

        categoriesContainer.appendChild(inputContainer);
    }

    let selectTag = document.getElementById("sort");
    for(let i=0;i<allSortOptionsLS.length;i++){
        let optionTag = document.createElement("option");

        optionTag.classList.add("option-tag");
        optionTag.value = allSortOptionsLS[i].value;
        optionTag.innerText = allSortOptionsLS[i].name;

        selectTag.appendChild(optionTag);
    }

    $(document).on("keyup","#input-search",()=>{
        collectUserSearchPreferences()
        displayShopArticles();
    })

    $(document).on("keyup","#price-min",()=>{
        collectUserSearchPreferences()
        displayShopArticles();
    })

    $(document).on("keyup","#price-max",()=>{
        collectUserSearchPreferences()
        displayShopArticles();
    })

    $(document).on("change","#sort",()=>{
        collectUserSearchPreferences();
        displayShopArticles();
    })

    if(!getItemFromLocalStorage("userSearchPreferences")){
        collectUserSearchPreferences();
        displayShopArticles();
    }else{
        setUserSearchPreferences();
        displayShopArticles();
    }
}

function displayShopArticles(){
    let userSearchPreferences = getItemFromLocalStorage("userSearchPreferences");

    let allBooksLS = getItemFromLocalStorage("allBooks");

    let filteredBooks = [];

    filteredBooks = allBooksLS.filter(x=>x.name.toLowerCase().includes(userSearchPreferences.search.toLowerCase()));

    if(Number(userSearchPreferences.priceMin) > 0){
        filteredBooks = filteredBooks.filter(x=>x.price > Number(userSearchPreferences.priceMin))
    }

    if(Number(userSearchPreferences.priceMax) > 0){
        filteredBooks = filteredBooks.filter(x=>x.price < Number(userSearchPreferences.priceMax))
    }

    if(userSearchPreferences.categories.length){
        filteredBooks = filteredBooks.filter((book)=>{
            return book.category.some((cat)=>{
             return userSearchPreferences.categories.includes(String(cat));
            })
         });
    }


    if(userSearchPreferences.sort == "popular"){
        filteredBooks.sort((a,b)=>{
            return b.reviews.reviewsNumber - a.reviews.reviewsNumber
        })
    }else if(userSearchPreferences.sort == "newest"){
        filteredBooks.sort((a,b)=>{
            return new Date(b.releaseDate) - new Date(a.releaseDate)
        })
    }else if(userSearchPreferences.sort == "price-asc"){
        filteredBooks.sort((a,b)=>{
            return a.price - b.price
        })
    }else if(userSearchPreferences.sort == "price-desc"){
        filteredBooks.sort((a,b)=>{
            return b.price - a.price
        })
    }else if(userSearchPreferences.sort == "name-asc"){
        filteredBooks.sort((a,b)=>{
            if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
        })
    }else if(userSearchPreferences.sort == "name-desc"){
        filteredBooks.sort((a,b)=>{
            if (a.name < b.name) {
                return 1;
              }
              if (a.name > b.name) {
                return -1;
              }
              return 0;
        })
    }

    let ulTag = document.getElementById("articles-container-ul");

    while(ulTag.firstChild){
        ulTag.removeChild(ulTag.firstChild);
    }

    for(let i=0;i<filteredBooks.length;i++){
        let liTag = document.createElement("li");
        liTag.classList.add("li-tag-article-container")
        let article = bookArticleGenerator(filteredBooks[i].id,false,false);
        liTag.appendChild(article);
        ulTag.appendChild(liTag);
    }

    let element  = document.querySelector(".pagination-container");
    if(element)element.remove();


    $("#articles-container-ul").paginathing({
        perPage: 20,
        prevNext: false,
        firstLast: false
    });

    displayImgSrc();

    $(document).on("click",".page-item",()=>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        displayImgSrc();
    })
}

function displayImgSrc(){

    let elementNew  = document.querySelector("#articles-container-ul");

    let visibleChildren = elementNew.querySelectorAll(':not([hidden]) img');

    let page = document.querySelector(".active a").innerText;

    const pageCount = 20;
    let elemetsOnAPage = Array.from(visibleChildren).slice((page-1)*20,pageCount*page);

    for(let i=0;i<elemetsOnAPage.length;i++){
        let id = elemetsOnAPage[i].getAttribute("data-id")
        elemetsOnAPage[i].src = `../assets/images/books/book${id}.jpg`;
    }

}

function setUserSearchPreferences(){
    let userSearchPreferences = getItemFromLocalStorage("userSearchPreferences");

    let searchTag = document.getElementById("input-search");
    searchTag.value = userSearchPreferences.search;

    let priceMin = document.getElementById("price-min");
    priceMin.value = userSearchPreferences.priceMin;

    let priceMax = document.getElementById("price-max");
    priceMax.value = userSearchPreferences.priceMax;

    let checkboxes = document.querySelectorAll('input[name="categories"]');

    for(let i=0;i<checkboxes.length;i++){
        for(let j=0;j<userSearchPreferences.categories.length;j++){

            if(checkboxes[i].id == userSearchPreferences.categories[j]){

                checkboxes[i].checked = true;
            }
        }
    }

    let sortTag = document.getElementById("sort");
    sortTag.value = userSearchPreferences.sort
}

function collectUserSearchPreferences(){
    let userSearchPreferences = {
        search:"",
        priceMin:"",
        priceMax:"",
        categories:[],
        sort:""
    }


    let searchTag = document.getElementById("input-search");
    userSearchPreferences.search = searchTag.value;

    let minPriceTag = document.getElementById("price-min");
    userSearchPreferences.priceMin = minPriceTag.value;

    let maxPriceTag = document.getElementById("price-max");
    userSearchPreferences.priceMax = maxPriceTag.value;
    
    let checkboxes = document.querySelectorAll('input[name="categories"]:checked');
    
    for(let i=0;i<checkboxes.length;i++){
        userSearchPreferences.categories.push(checkboxes[i].id);
    }

    let sectionTag = document.getElementById("sort");
    userSearchPreferences.sort = sectionTag.value


    setItemToLocalStorage("userSearchPreferences",userSearchPreferences);
}

function displayReviews(book){
    ajaxCallBack("comments.json",function(comments){
        let section = document.getElementById("review-section");

        let reviewContainer = document.createElement("div");
        reviewContainer.setAttribute("id","review-container");
    
        let heading = document.createElement("h2");
        heading.innerText = `Reviews for ` + book.name;
    
        reviewContainer.appendChild(heading);
    
        let divStars = document.createElement("div");
        divStars.setAttribute("id","review-stars-container");
    
        for(let i=0;i<5;i++){
            if(book.reviews.stars > i){
                divStars.innerHTML += `<i class="fa-solid fa-star"></i>`
            }else{
                divStars.innerHTML += `<i class="fa-regular fa-star"></i>`
            }
        }
    
        if(book.reviews.stars > 0){
            divStars.innerHTML += ` <p>${book.reviews.stars}/5</p>`;
        }
    
        reviewContainer.appendChild(divStars);
    
        let divReviewInfo = document.createElement("div");
        divReviewInfo.setAttribute("id","review-info");

        let commentsOfTheBook = comments.filter(x=>x.bookId == book.id);
    
        divReviewInfo.innerHTML = `<p>${book.reviews.reviewsNumber} ratings</p>
                                    <p>${commentsOfTheBook.length} reviews</p>`;
    
        
        reviewContainer.appendChild(divReviewInfo);
        
        section.appendChild(reviewContainer);
        if(commentsOfTheBook.length){
            displayComments(commentsOfTheBook)
        }

    })

}

function displayComments(comments){
    let commentsContainer = document.createElement("div");
    commentsContainer.setAttribute("id","comments-container-div")

    for(let i=0;i<comments.length;i++){
        let article = document.createElement("article");
        article.classList.add("article-comment");

        let userInfo = document.createElement("div");
        userInfo.classList.add("comment-user-info-container");

        let avatarAndName = document.createElement("div");
        avatarAndName.classList.add("avatar-and-name-container");

        let avatar = document.createElement("img");
        avatar.classList.add("set-brightness");
        avatar.alt = "avatar";
        avatar.src = `../assets/images/comments/avatars/${comments[i].avatar}`
        avatar.classList.add("comment-avatar");

        let username = document.createElement("p");
        username.innerText = comments[i].username;
        username.classList.add("comment-username");

        avatarAndName.appendChild(avatar);
        avatarAndName.appendChild(username);

        userInfo.appendChild(avatarAndName);

        let divStars = document.createElement("div");
        divStars.classList.add("comments-stars");

        for(let j=0;j<5;j++){
            if(comments[i].stars>j){
                divStars.innerHTML +=`<i class="fa-solid fa-star"></i>`;
            }else{
                divStars.innerHTML += `<i class="fa-regular fa-star"></i>`;
            }
        }

        divStars.innerHTML += `<p>${comments[i].stars}/5</p>`

        userInfo.appendChild(divStars);
        article.appendChild(userInfo);




        // Article comment text and pictures

        let commentTextAndPicturesContainer = document.createElement("div")
        commentTextAndPicturesContainer.classList.add("text-and-pictures-container");

        let commentText = document.createElement("div");
        commentText.classList.add("comment-text");

        for(let j=0; j<comments[i].text.length;j++){
            let pTag = document.createElement("p");
            pTag.classList.add("comment-text-row");
            
            pTag.innerText = comments[i].text[j];

            commentText.appendChild(pTag);
        }

        let commentPictures = document.createElement("div");
        commentPictures.classList.add("comment-pictures-container");

        for(let j=0;j<comments[i].pictures.length;j++){
            let imgTag = document.createElement("img");
            imgTag.classList.add("set-brightness")
            imgTag.classList.add("comment-picture");

            imgTag.alt = "user uploaded picture";
            imgTag.src = `../assets/images/comments/pictures/${comments[i].pictures[j]}`

            commentPictures.appendChild(imgTag);
        }

        commentTextAndPicturesContainer.appendChild(commentText);
        commentTextAndPicturesContainer.appendChild(commentPictures);

        article.appendChild(commentTextAndPicturesContainer);

        commentsContainer.appendChild(article);
    }

    let section = document.getElementById("review-section");
    section.appendChild(commentsContainer);
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
    imgTag.classList.add("set-brightness")
    imgTag.src = `../assets/images/books/book${id}.jpg`;
    imgTag.alt = `${book.name}`;

    containerImgDiv.appendChild(imgTag);

    let divPrice = document.createElement("div");
    divPrice.setAttribute("id","price-container");

    let priceTag = document.createElement("p");
    priceTag.innerText = `$${book.price}`;
    
    divPrice.appendChild(priceTag);
    divPrice.innerHTML += `<i id="book-id-${id}" class="fa-solid fa-cart-shopping"></i>`;


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
        starsDiv.innerHTML += `<p>no ratings</p>`;
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

    let conDiv = document.createElement("section");
    conDiv.setAttribute("id","related-categories-container")
    conDiv.classList.add("section-articles");
    section.appendChild(conDiv);


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
    if(url == "/Readily/index.html" || url == "/Readily/"){
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
    if(url == "/Readily/index.html" || url == "/Readily/"){
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
    bookImg.setAttribute("data-id",`${id}`);
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

    if(book.name.length >33){
        titleTag.innerText = book.name.substring(0,30) + " ...";
    }else{
        titleTag.innerText = book.name;
    }

    divTitleAndAuthor.appendChild(titleTag);
    divTitleAndAuthor.appendChild(authorTag);

    let divStarsAndCart = document.createElement("div");
    divStarsAndCart.classList.add("stars-and-cart-container");

    let cartTag = document.createElement("i");
    cartTag.classList.add('fa-solid','fa-cart-shopping','shopping-cart');
    cartTag.setAttribute("id",'book-id-'+book.id);

    cartTag.addEventListener("click",()=>{
        addToCart(book.id);
    })
    // Adding the click event on the icon


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
    if(!(url=="/Readily/index.html" || url=="/Readily/")){
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

        let preUrl = "";
        if(!(url=="/Readily/index.html" || url=="/Readily/")){
            preUrl ="pages/";
        }

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
        else if(url=="/Readily/index.html" || url=="/Readily/"){
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
    console.log(url);
    if(url=="/Readily/index.html" || url=="/Readily/"){
        
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