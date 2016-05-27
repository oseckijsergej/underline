# underline



## Usage Example

Just call underline as jQuery plugin on elements you want to decorate.

    <script type="text/javascript" src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script type="text/javascript" src="underline.js"></script>
    <script>
        $(document).ready(function () {
            $('body').underline();
        });
    </script>

## Options

Option | Default | Description
--- | --- | ---
`initTimeOut` | `100` | Before decorating element may be completely rendered. Therefore decorating process needs some time before initiate By default - 100ms. `$('body').underline({initTimeOut: 1000});`


