declare module 'numeral' {
    function numeral(value: number | string): any;
    namespace numeral {
        function format(value: any, format?: string): string;
        // Add more function signatures as needed
    }
    export = numeral;
}