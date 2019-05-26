(function () {
   
    var deck = [];
    var dealerHand = [];
    var dealerHoleCard = '';
    var playerHand = [];
    var balance = 0;
    var bet = 0;
    var lastBet = 0;
    var canBet = true;
    var hasBlackjack = false;
    
    function getHandValue(hand) {
        var value = 0;
        var hasAce = false;

        $.each(hand, function(index, card) {
            if (['T', 'J', 'Q', 'K'].includes(card[0])) {
                value += 10;
            } else if (card[0] === 'A') {
                hasAce = true;
                value++;
            } else {
                value += parseInt(card[0]);    
            }
        });

        //should we count one of the aces as 11?
        if (hasAce && ((value + 10) <= 21)) {
            value += 10;
        }

        return value;
    }
    
    function getCardHTML(card) {
        var cardValue = card[0];
        var cardSuit = card[1];
            
        if (cardValue === 'T') {
            cardValue = '10';
        }
        
        var html = '<div class="card">' + cardValue;
            
        switch (cardSuit) {
            case 'H':
                html += '<img src="img/hearts.png" alt="hearts" height="32">';
                break;
            case 'D':
                html += '<img src="img/diamonds.png" alt="diamonds" height="32">';
                break;
            case 'C':
                html += '<img src="img/clubs.png" alt="clubs" height="32">';
                break;
            case 'S':
                html += '<img src="img/spades.png" alt="spades" height="32">';
                break;
        }
        html += '</div>';
        
        return html;
    }
    
    // draw a card from the deck an display it
    function drawCard(card, hand, elementId) {
        var html = getCardHTML(card);
        hand.push(card);
        
        // display the card:
        $(elementId).append(html).children(':last').hide().fadeIn(1000);
        
        //update the hand values displayed below the cards:
        $('#dealer-value').text(getHandValue(dealerHand));
        $('#player-value').text(getHandValue(playerHand));
    }
    
    function newGame() {  
        $('#blackjack').append('<div class="popup">Place your bet</div>');
        
        canBet = true;
        hasBlackjack = false;
        
        $('#btn-deal').show();
        
        $('#btn-clear').prop('disabled', false);
        $('#btn-hit').hide();
        $('#btn-stand').hide();
        
        if ((balance - lastBet) >= 0) {
            bet = lastBet;
            balance -= bet;
        }
        else {
            bet = 0;
        }
        
        if (bet == 0) {
            $('#btn-deal').prop('disabled', true);
        }
        
        $('.bal').text(balance);
        $('.bet').text(bet);
        
        if (balance == 0 && bet == 0) {
            $('#blackjack .popup').remove();
            $('#blackjack').append('<div class="popup">You are out of credits<br>Hit "New Game" to start a new game</div>');
        }
    }
    
    function resetGame() {
        balance = 1000;
        bet = 0;
        lastBet = 0;
        
        $('#dealer-cards').empty();
        $('#player-cards').empty();
        
        $('#dealer-value').html('&nbsp;');
        $('#player-value').html('&nbsp;');
        
        $('#blackjack .popup').remove();
        
        newGame();
    }
    
    $(document).ready(function(){
        $('#btn-clear').click(function(){
            if (canBet && bet > 0) {
                balance += bet;
                bet = 0;
                    
                $('.bal').text(balance);
                $('.bet').text(bet);
                    
                $('#btn-deal').prop('disabled', true);
            }
        });
            
        $('.chip').click(function(e){
            var chipValue = $(e.delegateTarget).data('value');

            if ((balance - chipValue) >= 0 && canBet) {
                bet += chipValue;
                balance -= chipValue;

                $('.bal').text(balance);
                $('.bet').text(bet);
                $('#btn-deal').prop('disabled', false);
            }
        });
        
        $('#btn-deal').click(function(){
            $('#blackjack .popup').remove();
            
            $('#dealer-cards').empty();
            $('#player-cards').empty();
        
            $('#dealer-value').html('&nbsp;');
            $('#player-value').html('&nbsp;');
            
            canBet = false;
                
            deck = [];
            dealerHand = [];
            playerHand = [];
            
            for (var i = 1; i<13; i++) {
                if (i == 1) {
                    deck.push('AH');
                    deck.push('AD');
                    deck.push('AS');
                    deck.push('AC');
                }
                else if (i == 10) {
                    deck.push('TH');
                    deck.push('TD');
                    deck.push('TS');
                    deck.push('TC');
                }
                else if (i == 11) {
                    deck.push('JH');
                    deck.push('JD');
                    deck.push('JS');
                    deck.push('JC');
                }
                else if (i == 12) {
                    deck.push('QH');
                    deck.push('QD');
                    deck.push('QS');
                    deck.push('QC');
                }
                else if (i == 13) {
                    deck.push('KH');
                    deck.push('KD');
                    deck.push('KS');
                    deck.push('KC');
                }
                else {
                    deck.push(i + 'H');
                    deck.push(i + 'D');
                    deck.push(i + 'S');
                    deck.push(i + 'C');
                }
            }
            
            //shuffle the deck
            for (var i = deck.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = deck[i];
                deck[i] = deck[j];
                deck[j] = temp;
            }
            
            drawCard(deck.pop(), playerHand, '#player-cards');
            drawCard(deck.pop(), dealerHand, '#dealer-cards');
            drawCard(deck.pop(), playerHand, '#player-cards');
            
            card = deck.pop();
            dealerHoleCard = card;
            $('#dealer-cards').append('<div class="hole-card"></div>').children(':last').hide().fadeIn(1000).delay(1000);
                    
            
            $('#btn-deal').hide();
            $('#btn-clear').prop('disabled', true);
            $('#btn-hit').show();
            $('#btn-stand').show();
            
            if (getHandValue(playerHand) == 21) {
                hasBlackjack = true;
              
                $('#blackjack').append('<div class="popup">Blackjack!</div>');
                $('.popup').hide().fadeIn(500).delay(700).fadeOut(500, function() {
                    $(this).remove();
                    $('#btn-stand').click();
                });
            }
            
        });
        
        $('#btn-hit').click(function(){
            drawCard(deck.pop(), playerHand, '#player-cards');

            if (getHandValue(playerHand) > 21) {
                $('#blackjack').append('<div class="popup">Dealer Wins!</div>');
                $('.popup').hide().fadeIn(500).delay(700).fadeOut(500, function() {
                    $(this).remove();
                    lastBet = bet;
                    bet = 0;
                    newGame();       
                });   
            }
        });
        
        $('#btn-stand').click(function(){
            $('#dealer-cards').find('.hole-card').remove();
            drawCard(dealerHoleCard, dealerHand, '#dealer-cards');
            
            while (getHandValue(dealerHand) < 17 ) {
                drawCard(deck.pop(), dealerHand, '#dealer-cards');
            }
            
            if (getHandValue(dealerHand) > 21 ) {
                $('#blackjack').append('<div class="popup">You win!</div>');
                $('.popup').hide().fadeIn(500).delay(700).fadeOut(500, function() {
                    $(this).remove();
                    if (hasBlackjack) {
                        balance += bet + Math.floor(bet/2*3);
                    } else {
                        balance += bet * 2;
                    }
                    lastBet = bet;
                    bet = 0;
                    newGame();
                });
                         
            } else if (getHandValue(dealerHand) > getHandValue(playerHand)) {
                $('#blackjack').append('<div class="popup">Dealer wins!</div>');
                $('.popup').hide().fadeIn(500).delay(700).fadeOut(500, function() {
                    $(this).remove();
                    lastBet = bet;
                    bet = 0;
                    newGame();
                });
            } else if (getHandValue(dealerHand) == getHandValue(playerHand)) {
                $('#blackjack').append('<div class="popup">Push</div>');
                $('.popup').hide().fadeIn(500).delay(700).fadeOut(500, function() {
                    $(this).remove();
                    balance += bet;
                    lastBet = bet;
                    bet = 0;
                    newGame();
                });
            } else {
                $('#blackjack').append('<div class="popup">You win!</div>');
                $('.popup').hide().fadeIn(500).delay(700).fadeOut(500, function() {
                    $(this).remove();
                    if (hasBlackjack) {
                        balance += bet + Math.floor(bet/2*3);
                    } else {
                        balance += bet * 2;
                    }
                    lastBet = bet;
                    bet = 0;
                    newGame();
                });
            } 
        });
        
        $('#new-game-btn').click(function(){
            resetGame();
        });
        
        resetGame();
    });
    
}());