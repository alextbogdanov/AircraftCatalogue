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

$('.aircraft-spec').click(function() {
    openModal()
})