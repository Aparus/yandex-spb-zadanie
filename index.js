var myForm = {
    getData: function(){

        var form = document.querySelector("form");
        var formData = new FormData(form); 
        var result = {};

        for (var entry of formData.entries()){
            result[entry[0]] = entry[1];
        }

        return result
    }, 
    //validate() => { isValid: Boolean, errorFields: String[] }
    validate: function(){
        var isValid = true
        var errorFields = []
        var data = this.getData()

        if( validFio(data.fio) !== true )
            errorFields.push("fio")
        if( validEmail(data.email) !== true )
            errorFields.push("email")
        if( validPhone(data.phone) !== true )
            errorFields.push("phone")
        
        if(errorFields.length > 0)
            isValid = false

        return {isValid, errorFields}
    }, 
    //data = {fio: "Ivanov Ivan Ivanovich", email: "ivanov@ya.ru", phone: "+7(111)222-11-22"}
    setData: function(data){
        var form = document.querySelector("form");
        form.fio.value = data.fio
        form.email.value = data.email
        form.phone.value = data.phone
    }, 
    submit: function(){
        $('input').removeClass("error");

        var url = document.querySelector("form").action;
        
        var validation = this.validate();

        if(validation.isValid){
            $('#submitButton').addClass("disabled");
            $("#submitButton").prop('disabled', true);
            ajaxRequest(url, 0);
        }
        else {
            validation.errorFields.forEach(function(elem){
                console.log(elem);
                $('input[name='+elem+']').addClass("error");
                
            })
        }
    }
}


function validFio(fio){
    var fio_array = fio.trim().split(/\s+/g);
    if ( fio_array.length == 3 )
        return true
    else
        return "ФИО должно содержать три слова"
}

function validEmail(email){
    var domains = ["ya.ru", "yandex.ru", "yandex.ua", "yandex.by", "yandex.kz", "yandex.com"];
    email_array = email.split("@");
    var adress = email_array[0];
    var domain = email_array[1];
    if ( adress.length > 0 && email_array.length == 2 && domains.indexOf(domain) > -1 )
        return true
    else 
        return "После @ должен идти один из следующих доменов: " + domains.join(", ")
}

function validPhone(phone){
    //+7(999)999-99-99
    var phone_template = /\+7\(\d\d\d\)\d\d\d-\d\d-\d\d$/
    var template_match = phone.trim().match(phone_template); 

    if (template_match){
        var phone_sum = 0;
        var phone_array = template_match.input.replace(/[\(\)\-\+]/g, '').split("");
        phone_array.forEach(function(elem){
            phone_sum += parseInt(elem);
        })

        if (phone_sum <= 30)
            return true
        else 
            return "Превышена сумма. Она не должна превышать 30, и номер должен иметь формат: +7(999)999-99-99"
    }
    else
        return 'Неверный формат номера. Он должен иметь формат: +7(999)999-99-99, и сумма всех цифр не должна превышать 30'
}

    $('#myForm').submit( function(event){
        event.preventDefault();
        myForm.submit();
    });


//i - number of iteration while we recieve "data.status == progress"
function ajaxRequest(url, i){
    $.getJSON( url, function( data ) {
        console.log(i, data)
        analyzeResponce(data, url, i);
    });
}

//url - path which we would send again to server if responce status is "progress"
//i - iteretion number
function analyzeResponce(data, url, i) {
    if( data.status == "error" || data.status == "success"){
        $("#resultContainer").removeClass("progress");
    }
    if( data.status == "error" ){
        $("#resultContainer").addClass("error");
        $("#resultContainer").text(data.reason);
    }
    if( data.status == "success"){
        $("#resultContainer").addClass("success");
        $("#resultContainer").text("Success");        
    }
    if( data.status == "progress"){
        $("#resultContainer").addClass("progress");
        $("#resultContainer").text("in progress, timeout: "+data.timeout+"ms");
        var repeatQuery = setTimeout(function(){
            i++;
            ajaxRequest(url, i);
        }, data.timeout);
    }    
}