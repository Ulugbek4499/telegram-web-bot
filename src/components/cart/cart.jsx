import { totalPrice } from '../../units/total-price';
import Button from '../button/button';
import './cart.css';

const Cart = ({ cartItems, onCheckout }) => {
	return (
		<div className='cart__container'>
			<p>
				Total price:{' '}
				{totalPrice(cartItems).toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
				})}
			</p>

			<Button
				title={`${
					cartItems.length === 0 ? 'Order' : "Pay"
				}`}
				disable={cartItems.length === 0 ? true : false}
				type={'checkout'}
				onClick={onCheckout}
			/>
		</div>
	);
};

export default Cart;
