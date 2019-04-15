/* SIDE NAV MANUFACTURER DROPDOWN */
$('.manufacturer').click(function() {
    let num = $(this).parent().children('.manufacturer').index(this)

    if($('.manufacturer-models').eq(num).hasClass('hidden')) {
        $('.manufacturer-models').eq(num).slideDown().removeClass('hidden').addClass('toggled')
        $('.manufacturer i').eq(num).addClass('up')
    } else {
        $('.manufacturer-models').eq(num).slideUp().removeClass('toggled').addClass('hidden')
        $('.manufacturer i').eq(num).removeClass('up')
    }
})

/* SIDE NAV FAMILY DROPDOWN */
// $('.family').click(function() {
//     let parentNum = $(this).parent().parent().children('.manufacturer').index(this)
//     let num = $(this).parent().children().index(this)

//     console.log(parentNum)

//     if($('.manufacturer-families').eq(num).hasClass('hidden')) {
//         $('.manufacturer-families').eq(num).slideDown().removeClass('hidden').addClass('toggled')
//         $('.family i').eq(num).addClass('up')
//     } else {
//         $('.manufacturer-families').eq(num).slideUp().removeClass('toggled').addClass('hidden')
//         $('.family i').eq(num).removeClass('up')
//     }
// })

/* SIDE NAV FIXED POSITION */

$(window).scroll(function() {
    let scrollTopValue = $(window).scrollTop()
    let scrollTillFixed = $('#top-nav').outerHeight() 

    if(scrollTopValue >= scrollTillFixed) {
        $('#side-nav').addClass('fixed')
    } else {
        $('#side-nav').removeClass('fixed')
    }
})

/* OPEN MODAL */
$(document).ready(function() {
    if($('body').hasClass('toggled')) {
        openModal()
    }
})