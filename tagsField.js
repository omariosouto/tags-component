const tagsField = (() => {
    let $tagsFieldInput;
    let $tagsFieldInputHidden;
    let $tagsFieldList;
    let APIEndPoint; 

    function setupInputField(tagsFieldInputSelector) {
        $tagsFieldInput = document.querySelector(tagsFieldInputSelector)
        $tagsFieldInput.classList.add('tagsField__input')
        $tagsFieldInput.addEventListener('input', handleUserInput)    
        setupInputHiddenField()

        function handleUserInput({ target }) {
            const tagsDirty = target.value.trim().split(',')
            const hasMoreThanOneTag = tagsDirty.length > 1
            const tagNames = tagsDirty.filter((tagName) => tagName)

            if(hasMoreThanOneTag) {
                tagNames.forEach((tagName) => {
                    TagsService.sendTagToServer(tagName)
                        .then(tag => {
                            createTagListItem(tag.name, tag.id)
                            updateInputHiddenValues()
                        })
                        .then(clearInputField)
                })
            }
        }

        function clearInputField() {
            $tagsFieldInput.value = ''   
        }

        function setupInputHiddenField() {
            const tagsFieldInputDataName = $tagsFieldInput.getAttribute('data-name')
            const template = `<input class="tagsField__inputHidden" type="text" name="${tagsFieldInputDataName}">`
    
            $tagsFieldInput.insertAdjacentHTML('afterend', template)
            $tagsFieldInputHidden = $tagsFieldInput.parentNode.querySelector('.tagsField__inputHidden')
        }    
    }

    function updateInputHiddenValues() {
        const tags = Array.from($tagsFieldList.querySelectorAll('li')).map((element) => {
            return {
                id: element.getAttribute('data-id'),
                name: element.innerText.trim()
            }
        })
        $tagsFieldInputHidden.value = JSON.stringify(tags)
    }

    function setupTagList() {
        const template = `<ul class="tagsField__list"></ul>`
        $tagsFieldInput.insertAdjacentHTML('afterend', template)    
        $tagsFieldList = $tagsFieldInput.parentNode.querySelector('.tagsField__list')


        $tagsFieldList.addEventListener('click', removeTagListItem)

        function removeTagListItem({ target }) {
            if(target.classList.contains('tagsField__listItemBtnClose')) {
                target.closest('.tagsField__listItem').remove()
                updateInputHiddenValues()
            }

        }
    }

    function createTagListItem(tagName, tagId) {
        const template = `
            <li class="tagsField__listItem" data-id="${tagId}">
                <button class="tagsField__listItemBtnClose">X</button> 
                <span class="label label-default">
                    ${tagName}
                </span>
            </li>
        `
        $tagsFieldList.insertAdjacentHTML('afterbegin', template)   
    }

    const TagsService = {
            defaultResponseHandler: (res) => {
                if(res.ok) return res.json()
                alert('Erro na comunicação com o servidor :(')
            },
            sendTagToServer: function sendTagToServer(tagName) {
                return fetch(APIEndPoint, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: tagName,
                    })
                })
                .then(this.defaultResponseHandler)
            },
            getTagsFromServer: function getTagsFromServer() {
                return fetch(APIEndPoint)
                    .then(this.defaultResponseHandler)
            }
    }

    return ({ inputSelector, APITagsEndpoint, getTagsOnLoad }) => {
        APIEndPoint = APITagsEndpoint;
        setupInputField(inputSelector)        
        setupTagList()
        getTagsOnLoad && TagsService
            .getTagsFromServer()
            .then(tags => tags.forEach(tag => createTagListItem(tag.name, tag.id)))
            .then(updateInputHiddenValues)
    }
})()
