export default function JerusalemCross({ className }) {
    return (
        <svg
            viewBox="0 0 512 512"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Main Central Cross (Cross Potent-ish or Greek) */}
            <path d="M224 32V192H64V288H224V448H288V288H448V192H288V32H224Z" />

            {/* Top Left Small Cross */}
            <path d="M96 96V64H128V96H160V128H128V160H96V128H64V96H96Z" />

            {/* Top Right Small Cross */}
            <path d="M384 96V64H416V96H448V128H416V160H384V128H352V96H384Z" />

            {/* Bottom Left Small Cross */}
            <path d="M96 384V352H128V384H160V416H128V448H96V416H64V384H96Z" />

            {/* Bottom Right Small Cross */}
            <path d="M384 384V352H416V384H448V416H416V448H384V416H352V384H384Z" />
        </svg>
    );
}
