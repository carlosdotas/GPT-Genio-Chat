$(function() {

    // Histórico da conversa
    var conversationHistory = JSON.parse(localStorage.getItem('conversationHistory')) || [];

    // Carregar histórico da conversa salvo
    loadConversationHistory();

    function loadConversationHistory() {
        // Limpar todas as mensagens na tela
        $('.easyui-panel').empty();

        // Carregar o histórico da conversa salvo
        conversationHistory.forEach((message, index) => {
            showMessage(message.content, message.role, null, index);
        });
    }

    // Função para exibir uma mensagem
    function showMessage(message, role, time, index) {
        var avatar = $('<div class="avatar"></div>');
        var content = $('<div class="content"></div>');
        var meta = $('<div class="meta"></div>');

        if (role === 'assistant') {
            avatar.addClass('easyui-tooltip').attr('title', 'GPT Gênio').tooltip();
            avatar.css('background-color', '#357ae8');
        }

        content.append($('<div class="message-text"></div>').css('white-space', 'pre-wrap').html(message));
        
        var deleteButton = $('<a href="#" class="easyui-linkbutton" style="height:15px; font-size: 5px;" plain="true">EXCLUIR</a>');
        //if (role === 'assistant') {
            var copyButton = $('<a href="#" class="easyui-linkbutton" style="height:15px; font-size: 5px;" plain="true">COPY</a>');
            var readButton = $('<a href="#" class="easyui-linkbutton" style="height:15px; font-size: 5px;" plain="true">LER</a>');
            var shareButton = $('<a href="#" class="easyui-linkbutton" style="height:15px; font-size: 5px;" plain="true">COMPARTILHAR</a>');
            
            copyButton.on('click', function(e) {
                e.preventDefault();
                var temp = $("<textarea>");
                $("body").append(temp);
                temp.val(message).select();
                document.execCommand("copy");
                temp.remove();
                $.messager.show({
                    title:'Texto copiado',
                    msg: message,
                    timeout:5000,
                    showType:'slide'
                });                
               
            });

            readButton.on('click', function(e) {
                e.preventDefault();
                // Adicione a função para ler o texto da mensagem aqui.
                // Exemplo: utilizando a API SpeechSynthesis (navegador)
                var msg = new SpeechSynthesisUtterance(message);
                window.speechSynthesis.speak(msg);
            });

            shareButton.on('click', function(e) {
                e.preventDefault();

                if (navigator.share) {
                    // Usando a API Web Share (dispositivos móveis e navegadores compatíveis)
                    navigator.share({
                        title: 'Mensagem do Assistente',
                        text: message,
                    }).then(() => {
                        console.log('Mensagem compartilhada');
                    }).catch((error) => {
                        console.error('Erro ao compartilhar a mensagem:', error);
                    });
                } else {
                    // Fallback para compartilhamento via WhatsApp (apenas dispositivos móveis)
                    var whatsappURL = 'https://wa.me/?text=' + encodeURIComponent(message);
                    window.open(whatsappURL, '_blank');
                }
            });


        //}

        deleteButton.on('click', function(e) {
            e.preventDefault();

            // Remover a mensagem do DOM
            msg.remove();

            // Verificar se o índice está definido e atualizar o histórico da conversa e o localStorage
            if (typeof index !== 'undefined') {
                conversationHistory.splice(index, 1);
                localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));

                // Carregar o histórico da conversa novamente para atualizar as mensagens na tela
                loadConversationHistory();
            }
        });



        content.append($('<p></p>').html(copyButton).append(readButton).append(shareButton).append(deleteButton));
        content.append(meta.html(moment().format('HH:mm')));

        var msg = $('<div class="message"></div>');
        msg.addClass(role);
        msg.append(avatar);
        msg.append(content);

        $('.easyui-panel').append(msg);
        
        $('.easyui-linkbutton').linkbutton(); 

        $('.easyui-panel').scrollTop($('.easyui-panel').prop('scrollHeight'));
    }




        
        // Histórico da conversa
        var conversationHistory = [];

    // Função para enviar uma mensagem
    function sendMessage(message, agent,contento) {
        showMessage(message, 'user', null, conversationHistory.length);
        contento = $('#context').textbox('getValue');
        conversationHistory.push({ 'role': 'user', 'content': contento + message });


        $.messager.progress(); 
        // Chame a API do ChatGPT aqui e obtenha a resposta
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + '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'
            },
            body: JSON.stringify({
                'model': 'gpt-3.5-turbo',
                'messages': conversationHistory,
                'temperature': 0.7
            })
        })
        .then(response => response.json())
        .then(data => {
            var assistantResponse = data.choices[0].message.content;
            showMessage(assistantResponse, 'assistant', null, conversationHistory.length);

            conversationHistory.push({'role': 'assistant', 'content': assistantResponse});

            // Salvar histórico da conversa no localStorage
            localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));

            $.messager.progress('close');
        })
        .catch(error => {
            console.error(error);
            showMessage('Desculpe, não pude concluir sua solicitação. Por favor, tente novamente mais tarde.', 'assistant');
            $.messager.progress('close');
        });
    }


    // Quando o usuário enviar uma mensagem
    $('#input-message').searchbox({
        searcher: function(value) {
            event.preventDefault();
            var message = $('#input-message').textbox('getValue');
            sendMessage(message);
            $('#input-message').textbox('setValue', '');
        }
    });
});