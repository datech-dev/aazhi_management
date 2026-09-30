import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_marketing_presentation(output_path):
    prs = Presentation()
    
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    blank_layout = prs.slide_layouts[6]
    
    # Color Palette Definitions (Luxury Marketing Aesthetic)
    BG_DARK = RGBColor(15, 23, 42)        # Rich Midnight Slate (#0F172A)
    CARD_BG = RGBColor(30, 41, 59)        # Card Background (#1E293B)
    CARD_BORDER = RGBColor(234, 179, 8)   # Warm Gold Accent (#EAB308)
    TEXT_WHITE = RGBColor(255, 255, 255)  # Pure White
    TEXT_GOLD = RGBColor(250, 204, 21)    # Bright Champagne Gold (#FACC15)
    TEXT_MUTED = RGBColor(203, 213, 225) # Soft Slate Grey (#CBD5E1)
    ACCENT_GREEN = RGBColor(34, 197, 94)  # Success Green (#22C55E)
    ACCENT_RED = RGBColor(244, 63, 94)    # Alert Rose (#F43F5E)
    
    def set_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_DARK
        
    def add_header(slide, title, tagline="FOR FASHION BOUTIQUES, BRIDAL WEAR & TAILORING STUDIOS"):
        # Top tagline / category
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.35))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = tagline.upper()
        p_t.font.size = Pt(11)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_GOLD
        p_t.font.name = 'Georgia'
        
        # Main Title
        m_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.733), Inches(0.75))
        tf_m = m_box.text_frame
        tf_m.word_wrap = True
        p_m = tf_m.paragraphs[0]
        p_m.text = title
        p_m.font.size = Pt(26)
        p_m.font.bold = True
        p_m.font.color.rgb = TEXT_WHITE
        p_m.font.name = 'Georgia'
        
        # Golden Divider Line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.733), Inches(0.03))
        line.fill.solid()
        line.fill.fore_color.rgb = CARD_BORDER
        line.line.fill.background()

    def add_card(slide, left, top, width, height, title, items, kicker=None, card_bg=CARD_BG, border_color=CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = card_bg
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
        
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        if kicker:
            pk = tf.paragraphs[0]
            pk.text = kicker.upper()
            pk.font.size = Pt(10)
            pk.font.bold = True
            pk.font.color.rgb = TEXT_GOLD
            pk.space_after = Pt(4)
            pt = tf.add_paragraph()
        else:
            pt = tf.paragraphs[0]
            
        pt.text = title
        pt.font.size = Pt(18)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_GOLD
        pt.font.name = 'Georgia'
        pt.space_after = Pt(10)
        
        for item in items:
            pi = tf.add_paragraph()
            pi.space_after = Pt(8)
            pi.font.size = Pt(13)
            pi.font.name = 'Calibri'
            
            if isinstance(item, tuple):
                run1 = pi.add_run()
                run1.text = "• " + item[0] + ": "
                run1.font.bold = True
                run1.font.color.rgb = TEXT_WHITE
                
                run2 = pi.add_run()
                run2.text = item[1]
                run2.font.color.rgb = TEXT_MUTED
            else:
                run = pi.add_run()
                run.text = "• " + item
                run.font.color.rgb = TEXT_MUTED

    def add_footer(slide, current_slide, total_slides=12):
        box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.35))
        tf = box.text_frame
        p = tf.paragraphs[0]
        p.text = f"Aazhi Designer Studio — Smart Boutique Management Platform | Slide {current_slide} of {total_slides}"
        p.font.size = Pt(10)
        p.font.color.rgb = RGBColor(148, 163, 184)

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide (Cover)
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_background(s1)
    
    frame = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.5), Inches(12.333), Inches(6.5))
    frame.fill.background()
    frame.line.color.rgb = CARD_BORDER
    frame.line.width = Pt(2)
    
    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(2.2))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    
    p1 = tf1.paragraphs[0]
    p1.text = "🪡 Run Your Dream Boutique Without the Everyday Chaos!"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_GOLD
    p1.font.name = 'Georgia'
    p1.space_after = Pt(12)
    
    p2 = tf1.add_paragraph()
    p2.text = "Meet Aazhi Designer Studio — The Simple, Smart Digital Assistant for Fashion Designers & Tailoring Studios"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.font.name = 'Georgia'
    p2.space_after = Pt(16)
    
    p3 = tf1.add_paragraph()
    p3.text = "Organize customer inquiries, store fitting measurements digitally, track orders live, and get paid 100% on time."
    p3.font.size = Pt(16)
    p3.font.color.rgb = TEXT_MUTED
    p3.font.name = 'Calibri'
    
    tb1_b = s1.shapes.add_textbox(Inches(1.0), Inches(4.8), Inches(11.333), Inches(1.5))
    tf1_b = tb1_b.text_frame
    p_b1 = tf1_b.paragraphs[0]
    p_b1.text = "✨ Designed Specially for Boutique Owners, Custom Tailors & Indian Fashion Designers"
    p_b1.font.size = Pt(14)
    p_b1.font.bold = True
    p_b1.font.color.rgb = TEXT_GOLD
    
    p_b2 = tf1_b.add_paragraph()
    p_b2.text = "No technical skills needed • Works on Mobile & PC • Instant Setup"
    p_b2.font.size = Pt(13)
    p_b2.font.color.rgb = TEXT_WHITE

    # -------------------------------------------------------------
    # SLIDE 2: Sound Familiar? (The Pain Points)
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_background(s2)
    add_header(s2, "Does This Sound Like a Typical Day in Your Boutique?")
    
    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.9),
             "📱 Flooded Social DMs",
             [("Customer Inquiries Everywhere", "Messages piling up on Instagram DMs and WhatsApp."),
              ("Forgotten Replies", "Forgetting who asked for a blouse quote or saree price."),
              ("Lost Potential Sales", "Customers buy elsewhere because you replied too late.")],
             kicker="Problem #1")
             
    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.9),
             "📓 Paper Notebook Chaos",
             [("Misplaced Measurements", "Can't find the notebook where a client's measurements were written."),
              ("Fitting Complaints", "Garments stitched with old measurements causing expensive re-stitches."),
              ("Illegible Handwriting", "Tailors misreading numbers and ruining costly designer fabric.")],
             kicker="Problem #2")

    add_card(s2, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.9),
             "💸 Constant Calls & Lost Money",
             [("Continuous Interruptions", "Clients calling 5 times a day: 'Is my blouse ready?'"),
              ("Uncollected Balances", "Delivering outfits before receiving the full 50% balance."),
              ("Stress & Overwork", "Spending evenings updating records instead of designing.")],
             kicker="Problem #3")
             
    add_footer(s2, 2)

    # -------------------------------------------------------------
    # SLIDE 3: What is a Boutique Management System? (Simple Analogy)
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_background(s3)
    add_header(s3, "What is Aazhi? Think of it as Your Smart Studio Assistant!")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9),
             "💡 Simple & Friendly Explanation",
             [("Your Digital Manager", "Aazhi is a super-simple tool on your phone/laptop that manages your boutique's daily work."),
              ("Zero Computer Knowledge Needed", "If you know how to use WhatsApp, you can easily use Aazhi!"),
              ("One Central Place", "Brings your customer chats, measurements, tailoring progress, and bills together."),
              ("Focus on Your Passion", "Lets you focus on designing stunning outfits while Aazhi handles the paperwork.")],
             kicker="No Technical Jargon Needed")

    # 4 Key Benefits Badges on the right
    b_items = [
        ("📥 1. Centralizes All Customer Chats", "Organizes WhatsApp & Instagram DMs in one simple screen."),
        ("📏 2. Saves Measurements Safely", "Digital fitting cards for Blouses, Kurtis, Sarees & Lehengas."),
        ("🪡 3. Tracks Tailoring Live", "Know exact status: Cutting ✂️, Stitching 🪡, or Ready 🚚."),
        ("💰 4. Ensures 100% Payment", "Calculates advance deposits & balance due automatically in ₹.")
    ]
    
    top_pos = 1.8
    for title, desc in b_items:
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(top_pos), Inches(5.733), Inches(1.05))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)
        
        tb = s3.shapes.add_textbox(Inches(6.9), Inches(top_pos + 0.05), Inches(5.533), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_GOLD
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED
        
        top_pos += 1.25

    add_footer(s3, 3)

    # -------------------------------------------------------------
    # SLIDE 4: Feature 1 — Unified Social Inbox
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_background(s4)
    add_header(s4, "Feature 1: Never Miss an Instagram or WhatsApp Sale Again")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9),
             "📥 All Inquiries in One Inbox",
             [("WhatsApp & Instagram Combined", "No need to switch between apps — view all customer messages in one screen."),
              ("1-Click Customer Booking", "Convert a double-tap Instagram inquiry into a confirmed order immediately."),
              ("Team Sharing", "Assign inquiries to your sales staff so every customer gets a quick response."),
              ("Photo & Inspiration Saver", "Store client reference photos, design sketches, and fabric images right inside their profile.")],
             kicker="Capture Every Customer")

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9),
             "✨ How This Helps Your Business",
             [("10x Faster Replies", "Reply to price questions instantly before potential clients move to another designer."),
              ("Professional Image", "Impress luxury bridal clients with fast, organized, professional responses."),
              ("No Lost Contacts", "Even if a client contacts you 6 months later, their chat history & preferences are saved."),
              ("Higher Sales Conversion", "Turn 40% more social inquiries into paying customers.")],
             kicker="Business Growth")

    add_footer(s4, 4)

    # -------------------------------------------------------------
    # SLIDE 5: Feature 2 — Digital Customer Measurement Cards
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_background(s5)
    add_header(s5, "Feature 2: Digital Measurement Cards (Say Goodbye to Notebooks!)")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9),
             "📐 Perfect Fitting Profiles",
             [("Garment-Specific Forms", "Pre-built measurement cards for Blouses, Kurtis, Sarees, Lehengas, Suits, and Gowns."),
              ("Inches & Centimeters", "Easily record Bust, Waist, Hips, Shoulder, Armhole, Sleeve, and Neck Depths."),
              ("Design Style Notes", "Note down neck styles (Sweetheart, Boat neck, Deep back, Potli buttons) and lining preferences."),
              ("Always Available", "Access measurements instantly from your mobile phone anytime, anywhere.")],
             kicker="Zero-Error Tailoring")

    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9),
             "🛡️ Why Boutique Owners Love This",
             [("Historical Memory", "When a repeat client comes back after a year, their previous measurements are right there!"),
              ("Clear Tailor Printouts", "Give clean, typed measurement sheets to master tailors — no more handwriting confusion."),
              ("Order-Specific Locking", "Past order measurements stay locked so changes for a new garment won't alter old records."),
              ("95% Fewer Re-Stitches", "Drastically reduce fitting complaints and alterations.")],
             kicker="Peace of Mind")

    add_footer(s5, 5)

    # -------------------------------------------------------------
    # SLIDE 6: Feature 3 — Live Garment Tracker (Kanban)
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_background(s6)
    add_header(s6, "Feature 3: Live Garment Tracker (From Fabric to Delivery)")

    stages = [
        ("1. Cutting ✂️", "Master cutter inspects fabric, cuts patterns & updates status."),
        ("2. Stitching 🪡", "Assigned tailor stitches garment, attaches padding & lining."),
        ("3. Finishing 🧺", "Hemming, potli buttons, ironing & professional steam press."),
        ("4. Quality Check ✔️", "Verifying measurement profile & neck depth before packing."),
        ("5. Ready & Delivery 🚚", "Garment packaged, balance collected, ready for client pickup.")
    ]
    
    col_width = Inches(2.2)
    spacing = Inches(0.18)
    start_left = Inches(0.8)
    
    for i, (st_title, st_desc) in enumerate(stages):
        l_pos = start_left + i * (col_width + spacing)
        card_st = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l_pos, Inches(1.8), col_width, Inches(4.9))
        card_st.fill.solid()
        card_st.fill.fore_color.rgb = CARD_BG
        card_st.line.color.rgb = CARD_BORDER if i == 3 else RGBColor(75, 85, 99)
        card_st.line.width = Pt(1.5 if i == 3 else 1)
        
        tb = s6.shapes.add_textbox(l_pos + Inches(0.1), Inches(1.9), col_width - Inches(0.2), Inches(4.7))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_st = tf.paragraphs[0]
        p_st.text = st_title
        p_st.font.size = Pt(14)
        p_st.font.bold = True
        p_st.font.color.rgb = TEXT_GOLD
        p_st.space_after = Pt(10)
        
        p_sd = tf.add_paragraph()
        p_sd.text = st_desc
        p_sd.font.size = Pt(11)
        p_sd.font.color.rgb = TEXT_MUTED
        p_sd.space_after = Pt(14)
        
        p_feat = tf.add_paragraph()
        if i == 0:
            p_feat.text = "• Assigns Master Cutter\n• Pattern sheet printed"
        elif i == 1:
            p_feat.text = "• Tailor task list\n• Equal work load"
        elif i == 2:
            p_feat.text = "• Trims & lining check\n• Steam press status"
        elif i == 3:
            p_feat.text = "• Fit verification\n• Pass / Alteration"
        else:
            p_feat.text = "• Auto WhatsApp alert\n• Money collected"
        p_feat.font.size = Pt(10)
        p_feat.font.color.rgb = TEXT_WHITE

    add_footer(s6, 6)

    # -------------------------------------------------------------
    # SLIDE 7: Feature 4 — Automatic WhatsApp Client Updates
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_background(s7)
    add_header(s7, "Feature 4: Automatic WhatsApp Updates to Delighted Clients")

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9),
             "💬 Automatic Updates Sent for You",
             [("Order Confirmation", "Instantly messages the client when their order is placed with promised delivery date."),
              ("Payment Receipt", "Sends a neat digital receipt showing advance paid and remaining balance in ₹."),
              ("Ready for Pickup Alert", "Notifies client the second their outfit passes Quality Check!"),
              ("Zero Manual Typing", "Aazhi automatically inserts customer name & order details.")],
             kicker="Hands-Free Customer Care")

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9),
             "❤️ Why Clients Love Your Studio More",
             [("No Calling Required", "Clients don't need to call you 5 times asking for status updates."),
              ("Luxury Studio Feel", "Automated WhatsApp messages make your boutique look like a top-tier luxury brand."),
              ("Clear Delivery Expectations", "Prevents last-minute panic before weddings or festival events."),
              ("More Word-of-Mouth Referrals", "Delighted clients recommend your studio to friends & family!")],
             kicker="Brand & Trust Building")

    add_footer(s7, 7)

    # -------------------------------------------------------------
    # SLIDE 8: Feature 5 — 100% Payment Recovery
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_background(s8)
    add_header(s8, "Feature 5: 100% Payment Recovery & Income Security")

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9),
             "💰 Simple Financial Management",
             [("Rupee (₹) Precision Math", "Calculates item total, discounts, GST tax, advance paid, and balance due automatically."),
              ("Mandatory Advance Deposit", "Enforces taking a 50% advance before cutting fabric."),
              ("Balance Delivery Alert", "Warns staff if an outfit is being handed over with an unpaid balance."),
              ("All Payment Modes", "Records Cash, GPay / PhonePe / UPI, Card, and Bank Transfers.")],
             kicker="Protect Your Hard-Earned Profit")

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9),
             "📊 Easy Daily Financial Summary",
             [("Daily Income Snapshot", "See total cash & UPI collected today with one tap."),
              ("Pending Balances List", "View all pending customer balances in one clear list."),
              ("GST Ready Receipts", "Generate clean PDF bills for tax filing without accountant headaches."),
              ("Owner Security", "Only the Studio Owner can view overall monthly profits.")],
             kicker="Financial Clarity")

    add_footer(s8, 8)

    # -------------------------------------------------------------
    # SLIDE 9: Feature 6 — Fabric, Trims & Catalog Management
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_background(s9)
    add_header(s9, "Feature 6: Product Catalog & Fabric Inventory")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9),
             "👗 Showroom Designer Catalog",
             [("Organize Collections", "Catalog Sarees, Lehengas, Designer Blouses, Kurtis, and Dupattas."),
              ("Photo Showcases", "Show high-resolution outfit photos to clients during consultations."),
              ("Variants & Sizes", "Track available sizes (S, M, L, XL) and fabric colors."),
              ("Customizable Flags", "Mark outfits as 'Ready-to-Wear' or 'Custom Tailoring Available'.")],
             kicker="Showroom Presentation")

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9),
             "🧵 Raw Materials & Trims Tracking",
             [("Fabric Roll Tracking", "Keep count of raw silk, organza, net, and lining rolls."),
              ("Low Stock Warning", "Get alerted when lining fabric or potli buttons run low."),
              ("Cost vs Price", "Know exact profit margin on every custom outfit stitched."),
              ("Workshop Organization", "Never pause tailoring work due to missing trims or zipper stock.")],
             kicker="Zero Material Shortage")

    add_footer(s9, 9)

    # -------------------------------------------------------------
    # SLIDE 10: Before & After Aazhi
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_background(s10)
    add_header(s10, "The Transformation: Life Before vs After Aazhi")

    # Left Column: BEFORE
    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9),
             "❌ BEFORE AAZHI (Daily Stress)",
             [("Scattered Social DMs", "Lost customer inquiries on Instagram & WhatsApp."),
              ("Paper Notebooks", "Misplaced measurement books & fitting complaint re-stitches."),
              ("Constant Interruption", "Clients calling repeatedly to check if garment is ready."),
              ("Uncollected Balances", "Delivering outfits before collecting full payment."),
              ("Late Night Work", "Spending hours updating paper registers at night.")],
             kicker="Chaos & Frustration",
             card_bg=RGBColor(45, 20, 30),
             border_color=ACCENT_RED)

    # Right Column: AFTER
    add_card(s10, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9),
             "✅ AFTER AAZHI (Peace & Growth)",
             [("Unified Social Inbox", "Instant 10-second inquiry replies and higher sales."),
              ("Digital Fitting Cards", "Stored measurements with zero lost records or fitting errors."),
              ("Auto WhatsApp Updates", "Clients get auto status updates — zero annoying calls!"),
              ("100% Paid Balances", "Alerts enforce receiving full payment before pickup."),
              ("More Time for Design", "Run your studio smoothly and grow your designer brand.")],
             kicker="Efficiency & Prosperity",
             card_bg=RGBColor(20, 45, 30),
             border_color=ACCENT_GREEN)

    add_footer(s10, 10)

    # -------------------------------------------------------------
    # SLIDE 11: Real Business Impact
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_background(s11)
    add_header(s11, "Real Business Impact: Why Boutique Owners Love Aazhi")

    impact_items = [
        ("🚀 2x More Social Orders Converted", "Responding to Instagram & WhatsApp DMs in seconds converts 50% more prospective brides and clients."),
        ("✂️ 95% Reduction in Fitting Alterations", "Digital measurement cards and design notes eliminate expensive re-stitching and fabric waste."),
        ("⏱️ 10+ Hours Saved Every Week", "Stop spending hours answering phone calls or searching through paper notebooks."),
        ("💰 100% Order Balance Recovery", "Strict payment checks ensure every outfit is fully paid before it leaves your workshop.")
    ]

    top_pos = 1.8
    for title, desc in impact_items:
        card = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(top_pos), Inches(11.733), Inches(1.05))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1.5)
        
        tb = s11.shapes.add_textbox(Inches(1.0), Inches(top_pos + 0.1), Inches(11.333), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_GOLD
        p1.space_after = Pt(2)
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_MUTED
        
        top_pos += 1.25

    add_footer(s11, 11)

    # -------------------------------------------------------------
    # SLIDE 12: Get Started in 3 Simple Steps (CTA)
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_background(s12)
    add_header(s12, "Get Started with Aazhi in 3 Simple Steps")

    add_card(s12, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.9),
             "1. Friendly Demo",
             [("Schedule a 15-Minute Call", "See a friendly live demonstration of how Aazhi works on mobile or PC."),
              ("Ask Any Questions", "Our team understands fashion studio needs and guides you step-by-step."),
              ("Zero Commitment", "Explore all features with no obligation.")],
             kicker="Step 1")

    add_card(s12, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.9),
             "2. Custom Setup",
             [("We Do the Setup for You!", "We configure your blouse, kurti & lehenga measurement templates."),
              ("Upload Your Catalog", "Add your designer products and fabric items easily."),
              ("Staff Accounts", "Create simple logins for your sales staff and master tailors.")],
             kicker="Step 2")

    add_card(s12, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.9),
             "3. Enjoy Peaceful Growth",
             [("Start Day 1", "Begin managing social chats, measurements, and orders effortlessly."),
              ("Delight Your Clients", "Watch customer satisfaction and repeat orders soar!"),
              ("Dedicated Support", "Our support team is always a phone call or WhatsApp message away.")],
             kicker="Step 3")

    add_footer(s12, 12)

    prs.save(output_path)
    print(f"Marketing presentation saved successfully to {output_path}")

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(out_dir, "Aazhi_Designer_Studio_Marketing_Deck.pptx")
    create_marketing_presentation(out_path)
