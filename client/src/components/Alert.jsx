function Alert({ alert }) {
    return (
        alert &&
        <div className={`alert alert-${alert.type}`}> {alert.msg} </div>
    )
}

export default Alert;